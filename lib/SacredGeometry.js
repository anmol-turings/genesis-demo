"use client";
import { useRef, useEffect } from "react";

// Each archetype gets a unique sacred geometry pattern
const PATTERNS = {
  // Analyst — rotating mandala with data constellation points
  archos: (ctx, w, h, t, speaking, color) => {
    const cx = w / 2, cy = h / 2;
    const speed = speaking ? 1.5 : 0.3;
    const brightness = speaking ? 1 : 0.5;
    const rings = 5;

    for (let r = 0; r < rings; r++) {
      const radius = 20 + r * 18;
      const points = 6 + r * 2;
      const rotation = t * speed * (r % 2 === 0 ? 1 : -1) * 0.5;

      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2 + rotation;
        const wobble = Math.sin(t * 2 + r + i) * (speaking ? 4 : 1);
        const x = cx + Math.cos(angle) * (radius + wobble);
        const y = cy + Math.sin(angle) * (radius + wobble);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = hexWithAlpha(color, 0.15 + brightness * 0.15 - r * 0.02);
      ctx.lineWidth = speaking ? 1.5 : 0.8;
      ctx.stroke();

      // Constellation dots
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2 + rotation;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.arc(x, y, speaking ? 2.5 : 1.5, 0, Math.PI * 2);
        ctx.fillStyle = hexWithAlpha(color, 0.4 + brightness * 0.4);
        ctx.fill();
      }
    }

    // Center eye
    ctx.beginPath();
    ctx.arc(cx, cy, 6 + Math.sin(t * 2) * 2, 0, Math.PI * 2);
    ctx.fillStyle = hexWithAlpha(color, 0.6 * brightness);
    ctx.fill();
  },

  sophia: (...args) => PATTERNS.archos(...args),

  // Champion — angular star burst, sharp and fierce
  leonidas: (ctx, w, h, t, speaking, color) => {
    const cx = w / 2, cy = h / 2;
    const speed = speaking ? 2 : 0.4;
    const brightness = speaking ? 1 : 0.4;
    const spikes = 8;

    for (let layer = 0; layer < 3; layer++) {
      const scale = 1 + layer * 0.4;
      const rot = t * speed * (layer % 2 === 0 ? 0.7 : -0.5);

      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const angle = (i / (spikes * 2)) * Math.PI * 2 + rot;
        const r = i % 2 === 0 ? (40 + layer * 15) * scale : (15 + layer * 5) * scale;
        const pulse = speaking ? Math.sin(t * 4 + i) * 5 : 0;
        const x = cx + Math.cos(angle) * (r + pulse);
        const y = cy + Math.sin(angle) * (r + pulse);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = hexWithAlpha(color, 0.2 + brightness * 0.15 - layer * 0.05);
      ctx.lineWidth = speaking ? 2 - layer * 0.4 : 1;
      ctx.stroke();
    }

    // Lightning bolts when speaking
    if (speaking) {
      for (let b = 0; b < 3; b++) {
        const angle = t * 3 + b * 2.1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        let bx = cx, by = cy;
        for (let s = 0; s < 4; s++) {
          bx += Math.cos(angle + Math.sin(t * 5 + s) * 0.5) * 15;
          by += Math.sin(angle + Math.cos(t * 5 + s) * 0.5) * 15;
          ctx.lineTo(bx, by);
        }
        ctx.strokeStyle = hexWithAlpha(color, 0.3);
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  },

  artemis: (...args) => PATTERNS.leonidas(...args),

  // Healer — flower of life, organic flowing curves
  rafael: (ctx, w, h, t, speaking, color) => {
    const cx = w / 2, cy = h / 2;
    const speed = speaking ? 1.2 : 0.2;
    const brightness = speaking ? 1 : 0.4;
    const petals = 6;

    // Flower of life circles
    for (let ring = 0; ring < 3; ring++) {
      const ringRadius = 25 + ring * 20;
      for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2 + t * speed * 0.3;
        const px = cx + Math.cos(angle) * ringRadius * 0.5;
        const py = cy + Math.sin(angle) * ringRadius * 0.5;
        const breathe = Math.sin(t * (speaking ? 3 : 1) + i * 0.5 + ring) * (speaking ? 5 : 2);

        ctx.beginPath();
        ctx.arc(px, py, ringRadius * 0.5 + breathe, 0, Math.PI * 2);
        ctx.strokeStyle = hexWithAlpha(color, 0.1 + brightness * 0.1);
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Center pulse — heartbeat when speaking
    const heartbeat = speaking ? Math.abs(Math.sin(t * 4)) * 8 + 8 : 8 + Math.sin(t) * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, heartbeat, 0, Math.PI * 2);
    ctx.fillStyle = hexWithAlpha(color, 0.2 + brightness * 0.3);
    ctx.fill();

    // Ripple waves
    if (speaking) {
      for (let r = 0; r < 3; r++) {
        const rippleR = ((t * 30 + r * 30) % 80) + 10;
        ctx.beginPath();
        ctx.arc(cx, cy, rippleR, 0, Math.PI * 2);
        ctx.strokeStyle = hexWithAlpha(color, 0.3 * (1 - rippleR / 90));
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  },

  iris: (...args) => PATTERNS.rafael(...args),

  // Pathfinder — golden ratio spiral with wandering dots
  atlas: (ctx, w, h, t, speaking, color) => {
    const cx = w / 2, cy = h / 2;
    const speed = speaking ? 1.5 : 0.3;
    const brightness = speaking ? 1 : 0.4;

    // Golden spiral
    ctx.beginPath();
    const phi = 1.618;
    for (let i = 0; i < 200; i++) {
      const angle = i * 0.1 + t * speed * 0.5;
      const r = Math.pow(phi, angle / (Math.PI * 2)) * 3;
      if (r > 90) break;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = hexWithAlpha(color, 0.25 + brightness * 0.2);
    ctx.lineWidth = speaking ? 1.5 : 0.8;
    ctx.stroke();

    // Wandering dots along the spiral
    for (let d = 0; d < 8; d++) {
      const dotAngle = t * speed + d * 1.8;
      const dotR = Math.pow(phi, dotAngle / (Math.PI * 2)) * 3;
      if (dotR > 85) continue;
      const x = cx + Math.cos(dotAngle) * dotR;
      const y = cy + Math.sin(dotAngle) * dotR;
      ctx.beginPath();
      ctx.arc(x, y, speaking ? 3 : 2, 0, Math.PI * 2);
      ctx.fillStyle = hexWithAlpha(color, 0.5 + brightness * 0.3);
      ctx.fill();
    }

    // Compass points
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + t * 0.1;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * 75, cy + Math.sin(angle) * 75);
      ctx.lineTo(cx + Math.cos(angle) * 85, cy + Math.sin(angle) * 85);
      ctx.strokeStyle = hexWithAlpha(color, 0.3);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  },

  nova: (...args) => PATTERNS.atlas(...args),

  // Alchemist — morphing hexagonal sacred geometry
  hermes: (ctx, w, h, t, speaking, color) => {
    const cx = w / 2, cy = h / 2;
    const speed = speaking ? 2 : 0.4;
    const brightness = speaking ? 1 : 0.4;

    // Nested morphing hexagons
    for (let layer = 0; layer < 4; layer++) {
      const sides = 6;
      const radius = 20 + layer * 18;
      const morph = Math.sin(t * speed + layer * 1.5) * (speaking ? 12 : 4);
      const rot = t * speed * 0.3 * (layer % 2 === 0 ? 1 : -1);

      ctx.beginPath();
      for (let i = 0; i <= sides; i++) {
        const angle = (i / sides) * Math.PI * 2 + rot;
        const r = radius + morph * Math.sin(angle * 3 + t);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = hexWithAlpha(color, 0.15 + brightness * 0.15);
      ctx.lineWidth = speaking ? 1.5 : 0.8;
      ctx.stroke();

      // Connect vertices to center
      if (layer === 2) {
        for (let i = 0; i < sides; i++) {
          const angle = (i / sides) * Math.PI * 2 + rot;
          const r = radius + morph * Math.sin(angle * 3 + t);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
          ctx.strokeStyle = hexWithAlpha(color, 0.08 + brightness * 0.08);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    // Transmutation circle center
    const cRadius = 5 + Math.sin(t * (speaking ? 5 : 1.5)) * 3;
    ctx.beginPath();
    ctx.arc(cx, cy, cRadius, 0, Math.PI * 2);
    ctx.fillStyle = hexWithAlpha(color, 0.4 * brightness);
    ctx.fill();
  },

  kira: (...args) => PATTERNS.hermes(...args),

  // Architect — fractal tree / root system
  sovereign: (ctx, w, h, t, speaking, color) => {
    const cx = w / 2, cy = h / 2;
    const speed = speaking ? 1.2 : 0.3;
    const brightness = speaking ? 1 : 0.4;

    function drawBranch(x, y, angle, depth, maxDepth) {
      if (depth >= maxDepth) return;
      const len = (35 - depth * 6) * (0.8 + Math.sin(t * speed + depth) * 0.2);
      const sway = Math.sin(t * speed * 0.7 + depth * 0.8) * (speaking ? 0.15 : 0.05);
      const nx = x + Math.cos(angle + sway) * len;
      const ny = y + Math.sin(angle + sway) * len;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = hexWithAlpha(color, (0.3 - depth * 0.04) * brightness);
      ctx.lineWidth = Math.max(0.5, 3 - depth * 0.6);
      ctx.stroke();

      // Leaf dots at tips
      if (depth >= maxDepth - 1) {
        ctx.beginPath();
        ctx.arc(nx, ny, speaking ? 3 : 2, 0, Math.PI * 2);
        ctx.fillStyle = hexWithAlpha(color, 0.5 * brightness);
        ctx.fill();
      }

      const spread = 0.5 + Math.sin(t * 0.5) * 0.1;
      drawBranch(nx, ny, angle - spread, depth + 1, maxDepth);
      drawBranch(nx, ny, angle + spread, depth + 1, maxDepth);
    }

    // Upward tree
    drawBranch(cx, cy + 30, -Math.PI / 2, 0, speaking ? 6 : 5);

    // Downward roots (mirrored, dimmer)
    ctx.globalAlpha = 0.4;
    drawBranch(cx, cy + 30, Math.PI / 2, 0, speaking ? 5 : 4);
    ctx.globalAlpha = 1;

    // Foundation circle
    ctx.beginPath();
    ctx.arc(cx, cy + 30, 4, 0, Math.PI * 2);
    ctx.fillStyle = hexWithAlpha(color, 0.5 * brightness);
    ctx.fill();
  },

  gaia: (...args) => PATTERNS.sovereign(...args),
};

function hexWithAlpha(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16) || parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(3, 5), 16) || parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(5, 7), 16) || parseInt(hex.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, alpha))})`;
}

export default function SacredGeometry({ archetypeId, color, speaking, size = 200 }) {
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

    const draw = () => {
      const t = (Date.now() - startTime.current) / 1000;
      ctx.clearRect(0, 0, size, size);

      const pattern = PATTERNS[archetypeId] || PATTERNS.archos;
      pattern(ctx, size, size, t, speaking, color);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [archetypeId, color, speaking, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, display: "block" }}
    />
  );
}
