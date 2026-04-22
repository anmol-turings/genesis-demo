"use client";
import { useRef, useEffect } from "react";

// Converts hex to rgba with alpha
function rgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
}

// Concept modes that tweak the mandala motion:
// "still" - calm, slow rotation (rest, breath)
// "locked" - tight geometry (discipline, consistency, boundary)
// "unwinding" - expansion (release, integration)
// "tense" - sharp pulse (choice, tension)
// "flowing" - organic movement (connection, listening)
// "building" - accretion (growth, naming, meaning)

const CONCEPT_MODES = {
  rest: "still",
  breath: "still",
  consistency: "locked",
  boundary: "locked",
  choice: "tense",
  shadow: "tense",
  avoidance: "tense",
  integration: "unwinding",
  release: "unwinding",
  connection: "flowing",
  listen: "flowing",
  building: "building",
  naming: "building",
  meaning: "building",
  focus: "locked",
  default: "still",
};

// ─── MANDALA PATTERNS PER ARCHETYPE ─────────────────────────────────────────

const MANDALAS = {
  stoic: (ctx, w, h, t, color, mode) => {
    const cx = w / 2, cy = h / 2;
    const speed = mode === "tense" ? 2 : mode === "locked" ? 0.6 : 1;
    const brightness = mode === "still" ? 0.7 : 1;
    const pulse = Math.sin(t * (mode === "tense" ? 4 : 1.5)) * 0.5 + 0.5;

    // Star — angular, Roman
    const layers = 3;
    for (let l = 0; l < layers; l++) {
      const radius = 35 + l * 18;
      const spikes = 8;
      const rot = t * speed * (l % 2 === 0 ? 0.4 : -0.3);
      const morph = mode === "unwinding" ? pulse * 10 : mode === "building" ? l * 3 : 0;

      ctx.strokeStyle = rgba(color, 0.25 + brightness * 0.15 - l * 0.04);
      ctx.lineWidth = mode === "locked" ? 2 : 1.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      for (let i = 0; i <= spikes * 2; i++) {
        const a = (i / (spikes * 2)) * Math.PI * 2 + rot;
        const r = (i % 2 === 0 ? radius + morph : radius * 0.5);
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Core dot
    ctx.fillStyle = rgba(color, 0.5 + pulse * 0.3 * brightness);
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(cx, cy, 5 + (mode === "tense" ? pulse * 3 : 0), 0, Math.PI * 2);
    ctx.fill();

    // Tense mode — lightning
    if (mode === "tense") {
      ctx.strokeStyle = rgba(color, 0.4);
      ctx.lineWidth = 1;
      for (let b = 0; b < 4; b++) {
        const angle = t * 2 + b * Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        let bx = cx, by = cy;
        for (let s = 0; s < 5; s++) {
          bx += Math.cos(angle + Math.sin(t * 3 + s) * 0.4) * 12;
          by += Math.sin(angle + Math.cos(t * 3 + s) * 0.4) * 12;
          ctx.lineTo(bx, by);
        }
        ctx.stroke();
      }
    }
  },

  alchemist: (ctx, w, h, t, color, mode) => {
    const cx = w / 2, cy = h / 2;
    const speed = mode === "building" ? 0.8 : mode === "tense" ? 2 : 1;
    const brightness = mode === "still" ? 0.7 : 1;
    const pulse = Math.sin(t * 1.8) * 0.5 + 0.5;

    // Morphing hexagonal sacred geometry
    for (let layer = 0; layer < 4; layer++) {
      const sides = 6;
      const radius = 20 + layer * 15;
      const morph = mode === "unwinding" ? Math.sin(t * 1.5 + layer) * 14 :
                    mode === "building" ? layer * 2 + pulse * 5 :
                    Math.sin(t * speed + layer) * 6;
      const rot = t * speed * 0.3 * (layer % 2 === 0 ? 1 : -1);

      ctx.strokeStyle = rgba(color, 0.2 + brightness * 0.15 - layer * 0.03);
      ctx.lineWidth = 1.2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + rot;
        const r = radius + morph * Math.sin(angle * 3 + t);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Connect vertices to center on middle layer
      if (layer === 2 && mode !== "still") {
        for (let i = 0; i < sides; i++) {
          const angle = (i / sides) * Math.PI * 2 + rot;
          const r = radius + morph * Math.sin(angle * 3 + t);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
          ctx.strokeStyle = rgba(color, 0.08);
          ctx.stroke();
        }
      }
    }

    // Transmutation core
    ctx.fillStyle = rgba(color, 0.4 + pulse * 0.3 * brightness);
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(cx, cy, 4 + pulse * 2, 0, Math.PI * 2);
    ctx.fill();
  },

  explorer: (ctx, w, h, t, color, mode) => {
    const cx = w / 2, cy = h / 2;
    const speed = mode === "locked" ? 0.4 : 1;
    const brightness = mode === "still" ? 0.6 : 1;

    // Golden ratio spiral
    const phi = 1.618;
    ctx.strokeStyle = rgba(color, 0.3 + brightness * 0.15);
    ctx.lineWidth = mode === "locked" ? 2 : 1.5;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    for (let i = 0; i < 200; i++) {
      const angle = i * 0.1 + t * speed * 0.5;
      const r = Math.pow(phi, angle / (Math.PI * 2)) * 3;
      if (r > 90) break;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Wandering dots along the spiral
    for (let d = 0; d < 8; d++) {
      const dotAngle = t * speed + d * 1.8;
      const dotR = Math.pow(phi, dotAngle / (Math.PI * 2)) * 3;
      if (dotR > 85) continue;
      const x = cx + Math.cos(dotAngle) * dotR;
      const y = cy + Math.sin(dotAngle) * dotR;
      ctx.fillStyle = rgba(color, 0.6);
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(x, y, mode === "building" ? 3 : 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Compass points
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + t * 0.1;
      ctx.strokeStyle = rgba(color, 0.3);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * 75, cy + Math.sin(angle) * 75);
      ctx.lineTo(cx + Math.cos(angle) * 85, cy + Math.sin(angle) * 85);
      ctx.stroke();
    }
  },

  healer: (ctx, w, h, t, color, mode) => {
    const cx = w / 2, cy = h / 2;
    const speed = mode === "still" ? 0.6 : 1.2;
    const brightness = 0.7 + (mode !== "still" ? 0.3 : 0);
    const pulse = Math.sin(t * 1.5) * 0.5 + 0.5;

    // Flower of life
    const petals = 6;
    for (let ring = 0; ring < 3; ring++) {
      const ringRadius = 25 + ring * 18;
      for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2 + t * speed * 0.3;
        const px = cx + Math.cos(angle) * ringRadius * 0.5;
        const py = cy + Math.sin(angle) * ringRadius * 0.5;
        const breathe = Math.sin(t * (mode === "tense" ? 3 : 1) + i * 0.5 + ring) * 3;

        ctx.strokeStyle = rgba(color, 0.12 + brightness * 0.1);
        ctx.lineWidth = 1;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(px, py, ringRadius * 0.5 + breathe, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Center heartbeat
    const heartbeat = mode === "still" ? 8 + Math.sin(t) * 2 : Math.abs(Math.sin(t * 3)) * 6 + 6;
    ctx.fillStyle = rgba(color, 0.3 + pulse * 0.3 * brightness);
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(cx, cy, heartbeat, 0, Math.PI * 2);
    ctx.fill();

    // Ripple waves (flowing/unwinding)
    if (mode === "flowing" || mode === "unwinding") {
      for (let r = 0; r < 3; r++) {
        const rippleR = ((t * 25 + r * 30) % 80) + 10;
        ctx.strokeStyle = rgba(color, 0.3 * (1 - rippleR / 90));
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  },

  monk: (ctx, w, h, t, color, mode) => {
    const cx = w / 2, cy = h / 2;
    const breath = (Math.sin(t * (mode === "tense" ? 2 : 1.2)) + 1) / 2; // 0..1
    const brightness = 0.8;

    // Concentric ripples — always flowing slowly for monk
    for (let r = 0; r < 5; r++) {
      const phase = (t * 0.3 + r * 0.2) % 1;
      const radius = 20 + phase * 70;
      ctx.strokeStyle = rgba(color, (1 - phase) * 0.4);
      ctx.lineWidth = 1.2;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Stillness circle at center
    ctx.strokeStyle = rgba(color, 0.5 + breath * 0.3);
    ctx.lineWidth = 1.5;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(cx, cy, 20 + breath * 5, 0, Math.PI * 2);
    ctx.stroke();

    // Breath dot
    ctx.fillStyle = rgba(color, 0.4 + breath * 0.5);
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(cx, cy, 3 + breath * 3, 0, Math.PI * 2);
    ctx.fill();

    // Tense mode — agitation in the stillness
    if (mode === "tense") {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + t;
        const rx = cx + Math.cos(a) * (30 + Math.sin(t * 3 + i) * 8);
        const ry = cy + Math.sin(a) * (30 + Math.sin(t * 3 + i) * 8);
        ctx.fillStyle = rgba(color, 0.4);
        ctx.beginPath();
        ctx.arc(rx, ry, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },

  craftsman: (ctx, w, h, t, color, mode) => {
    const cx = w / 2, cy = h / 2;
    const speed = mode === "building" ? 0.8 : mode === "tense" ? 2 : 1.2;

    // Interlocking mechanical gears
    for (let g = 0; g < 3; g++) {
      const teeth = 10 + g * 2;
      const radius = 25 + g * 18;
      const rot = t * speed * (g % 2 === 0 ? 0.4 : -0.5);

      ctx.strokeStyle = rgba(color, 0.25 - g * 0.04);
      ctx.lineWidth = 1.3;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let i = 0; i <= teeth * 2; i++) {
        const angle = (i / (teeth * 2)) * Math.PI * 2 + rot;
        const r = i % 2 === 0 ? radius : radius - 5;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Inner circle
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 12, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(color, 0.15);
      ctx.stroke();
    }

    // Sparks (building / tense)
    if (mode === "building" || mode === "tense") {
      for (let s = 0; s < 6; s++) {
        const phase = (t * 1.5 + s * 0.3) % 1;
        const angle = (s / 6) * Math.PI * 2 + t * 0.5;
        const sx = cx + Math.cos(angle) * (30 + phase * 40);
        const sy = cy + Math.sin(angle) * (30 + phase * 40);
        ctx.fillStyle = rgba(color, (1 - phase) * 0.7);
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Central forge glow
    ctx.fillStyle = rgba(color, 0.4 + Math.sin(t * 3) * 0.2);
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
  },
};

// ─── COMPONENT ──────────────────────────────────────────────────────────────

export default function Mandala({ archetypeId, color, concept = "default", size = 240 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    const mode = CONCEPT_MODES[concept] || CONCEPT_MODES.default;

    const draw = () => {
      const t = (Date.now() - startTime.current) / 1000;
      ctx.fillStyle = "rgba(6, 6, 10, 0.18)";
      ctx.fillRect(0, 0, size, size);
      const fn = MANDALAS[archetypeId] || MANDALAS.stoic;
      fn(ctx, size, size, t, color, mode);
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [archetypeId, color, concept, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size, display: "block" }} />;
}
