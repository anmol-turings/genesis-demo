"use client";
import { useState } from "react";

// THE CONSTELLATION
//
// Knowledge dimension on the dashboard — pairs with THE PATH (practice).
// 8 nodes per problem: 3 foundation (inner ring), 3 depth (middle),
// 2 integration (outer). Click a node to toggle completion. Hover for
// tooltip with title, type, provider, duration, blurb.
//
// `learning` is the problem's lookup-table entry. `completed` is a Set
// of node ids. `onToggle(nodeId)` flips a node's completion state.

export default function Constellation({ learning, completed, onToggle, color = "#E8B86D" }) {
  const all = [
    ...(learning?.foundation || []).map(n => ({ ...n, ring: 0 })),
    ...(learning?.depth || []).map(n => ({ ...n, ring: 1 })),
    ...(learning?.integration || []).map(n => ({ ...n, ring: 2 })),
  ];
  const positions = computeLayout(all);
  const [hovered, setHovered] = useState(null);

  if (!all.length) return null;

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox="0 0 360 360" style={{ width: "100%", height: "auto", display: "block" }}>
        {/* Faint guide rings */}
        {[60, 110, 160].map((r, i) => (
          <circle
            key={i}
            cx={180}
            cy={180}
            r={r}
            fill="none"
            stroke="#3A4A5E"
            strokeWidth={0.5}
            strokeDasharray="2 4"
            opacity={0.4}
          />
        ))}

        {/* Connection lines */}
        {positions.map((p, i) => {
          if (!p) return null;
          return (p.connectsTo || []).map(j => {
            const q = positions[j];
            if (!q) return null;
            const lit = completed.has(p.id) && completed.has(q.id);
            return (
              <line
                key={`${i}-${j}`}
                x1={p.x} y1={p.y}
                x2={q.x} y2={q.y}
                stroke={lit ? color : "#3A4A5E"}
                strokeWidth={1}
                opacity={lit ? 0.8 : 0.4}
              />
            );
          });
        })}

        {/* Nodes */}
        {positions.map((p, i) => {
          if (!p) return null;
          const lit = completed.has(p.id);
          const r = p.ring === 0 ? 9 : p.ring === 1 ? 7 : 6;
          return (
            <g
              key={p.id}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onToggle(p.id)}
              style={{ cursor: "pointer" }}
            >
              {/* Halo when lit */}
              <circle cx={p.x} cy={p.y} r={r + 3}
                fill={lit ? `${color}30` : "transparent"} />
              {/* Node */}
              <circle
                cx={p.x} cy={p.y} r={r}
                fill={lit ? color : "transparent"}
                stroke={color}
                strokeWidth={1.5}
                style={{ transition: "fill 600ms cubic-bezier(0.22,1,0.36,1)" }}
              />
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hovered && (
        <Tooltip
          node={all.find(n => n.id === hovered)}
          completed={completed.has(hovered)}
        />
      )}
    </div>
  );
}

// Lay out 3 + 3 + 2 nodes across three concentric rings centred at (180,180).
function computeLayout(nodes) {
  const cx = 180, cy = 180;
  const groups = { 0: [], 1: [], 2: [] };
  nodes.forEach((n, i) => groups[n.ring].push({ ...n, originalIdx: i }));
  const radii = { 0: 60, 1: 110, 2: 160 };
  const positions = [];
  Object.entries(groups).forEach(([ring, group]) => {
    const r = radii[ring];
    const N = group.length;
    group.forEach((n, i) => {
      const offset = ring === "1" ? 0.4 : ring === "2" ? 0.8 : 0;
      const angle = (i / N) * Math.PI * 2 - Math.PI / 2 + offset;
      positions[n.originalIdx] = {
        id: n.id,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        ring: Number(ring),
        connectsTo: defaultLinks(i, ring),
      };
    });
  });
  return positions;
}

// Foundation → its depth pair; depth → its integration pair.
// Foundation occupies positions[0..2], depth [3..5], integration [6..7].
function defaultLinks(idx, ring) {
  if (ring === "0") return [3 + idx];
  if (ring === "1") return [6 + (idx % 2)];
  return [];
}

function Tooltip({ node, completed }) {
  if (!node) return null;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 36,
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--deep)",
        border: "1px solid rgba(255,255,255,0.12)",
        padding: "0.6rem 0.8rem",
        maxWidth: 260,
        pointerEvents: "none",
        zIndex: 5,
      }}
    >
      <div
        className="mono"
        style={{
          fontSize: "8px",
          color: "var(--silver)",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          marginBottom: 3,
        }}
      >
        {node.type} · {node.provider} · {node.durationMin} min
      </div>
      <div
        className="serif"
        style={{ fontSize: "0.9rem", color: "var(--cream)", marginBottom: 3 }}
      >
        {completed && "✓ "}
        {node.title}
      </div>
      <div style={{ fontSize: "0.75rem", color: "var(--silver)", lineHeight: 1.4 }}>
        {node.blurb}
      </div>
    </div>
  );
}
