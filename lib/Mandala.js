"use client";
import { useRef, useEffect } from "react";
import { getAudioController } from "./AudioController";

// ─── helpers ────────────────────────────────────────────────────────────────
function rgba(hex, a) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
}

// ─── MANDALA PATTERNS — adapted from the original Genesis SacredGeometry ────
// Each pattern receives:
//   ctx, w, h         canvas + dimensions
//   t                 elapsed seconds since mount
//   color             archetype hex color
//   vox               live voice amplitude (0..1) — drives ALL reactivity
//   scale             size / 200, so patterns scale with the canvas size
//
// vox replaces the original binary `speaking` flag with continuous behavior:
// when no audio is playing, vox=0 → calm baseline. When the mentor is
// speaking, vox follows the speaker's amplitude → pulse, glow, lightning,
// and motion track the voice.

const PATTERNS = {
  // ─── STOIC (Marcus Aurelius) — angular spartan starburst + lightning ──
  // Adapted from Genesis: leonidas
  stoic: (ctx, w, h, t, color, vox, scale) => {
    const cx = w / 2, cy = h / 2;
    const speaking = vox > 0.04;
    const speed = 0.4 + vox * 1.8;          // 0.4 idle → 2.2 loud
    const brightness = 0.4 + vox * 0.8;     // 0.4 idle → 1.2 loud
    const spikes = 8;

    ctx.shadowColor = color;

    for (let layer = 0; layer < 3; layer++) {
      const layerScale = (1 + layer * 0.4) * scale;
      const rot = t * speed * (layer % 2 === 0 ? 0.7 : -0.5);

      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const angle = (i / (spikes * 2)) * Math.PI * 2 + rot;
        const r = i % 2 === 0 ? (40 + layer * 15) * layerScale : (15 + layer * 5) * layerScale;
        const pulse = vox > 0.02 ? Math.sin(t * 4 + i) * 5 * vox * scale : 0;
        const x = cx + Math.cos(angle) * (r + pulse);
        const y = cy + Math.sin(angle) * (r + pulse);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = rgba(color, 0.2 + brightness * 0.15 - layer * 0.05);
      ctx.lineWidth = (speaking ? 2 - layer * 0.4 : 1) * scale;
      ctx.shadowBlur = (8 + vox * 16) * scale;
      ctx.stroke();
    }

    // Lightning bolts during speech — count + intensity scales with vox
    if (vox > 0.05) {
      const bolts = Math.floor(2 + vox * 4);
      for (let b = 0; b < bolts; b++) {
        const angle = t * 3 + b * 2.1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        let bx = cx, by = cy;
        for (let s = 0; s < 4; s++) {
          bx += Math.cos(angle + Math.sin(t * 5 + s) * 0.5) * 15 * scale;
          by += Math.sin(angle + Math.cos(t * 5 + s) * 0.5) * 15 * scale;
          ctx.lineTo(bx, by);
        }
        ctx.strokeStyle = rgba(color, 0.25 + vox * 0.3);
        ctx.lineWidth = 1 * scale;
        ctx.shadowBlur = 14 * scale;
        ctx.stroke();
      }
    }

    // Center sun
    ctx.beginPath();
    ctx.arc(cx, cy, (4 + vox * 4) * scale, 0, Math.PI * 2);
    ctx.fillStyle = rgba(color, 0.5 + vox * 0.5);
    ctx.shadowBlur = (16 + vox * 24) * scale;
    ctx.fill();
  },

  // ─── ALCHEMIST (Marie Curie) — morphing hexagonal sacred geometry ─────
  // Adapted from Genesis: hermes
  alchemist: (ctx, w, h, t, color, vox, scale) => {
    const cx = w / 2, cy = h / 2;
    const speaking = vox > 0.04;
    const speed = 0.4 + vox * 1.8;
    const brightness = 0.4 + vox * 0.8;

    ctx.shadowColor = color;

    for (let layer = 0; layer < 4; layer++) {
      const sides = 6;
      const radius = (20 + layer * 18) * scale;
      const morph = Math.sin(t * speed + layer * 1.5) * (4 + vox * 12) * scale;
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
      ctx.strokeStyle = rgba(color, 0.15 + brightness * 0.18);
      ctx.lineWidth = (speaking ? 1.5 : 0.8) * scale;
      ctx.shadowBlur = (6 + vox * 14) * scale;
      ctx.stroke();

      if (layer === 2) {
        // Vertex-to-center spokes — voice-reactive opacity
        for (let i = 0; i < sides; i++) {
          const angle = (i / sides) * Math.PI * 2 + rot;
          const r = radius + morph * Math.sin(angle * 3 + t);
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
          ctx.strokeStyle = rgba(color, 0.06 + brightness * 0.12);
          ctx.lineWidth = 0.5 * scale;
          ctx.stroke();
        }
      }
    }

    // Transmutation circle — pulses with voice
    const cRadius = (5 + Math.sin(t * (1.5 + vox * 4)) * 3 + vox * 4) * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, cRadius, 0, Math.PI * 2);
    ctx.fillStyle = rgba(color, 0.4 * brightness + vox * 0.4);
    ctx.shadowBlur = (16 + vox * 26) * scale;
    ctx.fill();
  },

  // ─── EXPLORER (Shackleton) — compass rose + concentric rings + spiral ─
  // Adapted from Genesis: atlas. The original phi spiral grew exponentially
  // and was unreadable at small sizes — here it's a layered compass with the
  // spiral as one element among several, all readable down to size 88.
  explorer: (ctx, w, h, t, color, vox, scale) => {
    const cx = w / 2, cy = h / 2;
    const speaking = vox > 0.04;
    const speed = 0.3 + vox * 1.5;
    const brightness = 0.5 + vox * 0.7;

    ctx.shadowColor = color;

    // Three concentric rings — the celestial frame
    const ringRadii = [38, 60, 82];
    ringRadii.forEach((r, i) => {
      ctx.beginPath();
      ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(color, (0.18 - i * 0.03) + brightness * 0.1 + vox * 0.15);
      ctx.lineWidth = (1 - i * 0.2) * scale;
      ctx.shadowBlur = (4 + vox * 10) * scale;
      ctx.stroke();
    });

    // 8-point compass rose — major and minor directions
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + t * 0.08;
      const major = i % 2 === 0;
      const inner = major ? 8 : 18;
      const outer = major ? 86 : 70;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * inner * scale, cy + Math.sin(angle) * inner * scale);
      ctx.lineTo(cx + Math.cos(angle) * (outer + (major ? vox * 8 : vox * 4)) * scale,
                 cy + Math.sin(angle) * (outer + (major ? vox * 8 : vox * 4)) * scale);
      ctx.strokeStyle = rgba(color, (major ? 0.35 : 0.15) + vox * 0.25);
      ctx.lineWidth = (major ? 1.5 : 0.8) * scale;
      ctx.shadowBlur = (3 + vox * 8) * scale;
      ctx.stroke();
    }

    // Inner phi spiral — bounded radius, visible at all sizes
    const phi = 1.618;
    ctx.beginPath();
    let started = false;
    for (let i = 0; i < 280; i++) {
      const angle = i * 0.13 + t * speed * 0.5;
      const r = Math.pow(phi, angle / (Math.PI * 2)) * 1.6 * scale;
      if (r < 4 * scale) continue;        // skip the inner stub
      if (r > 80 * scale) break;          // bound to fit inside the rings
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = rgba(color, 0.45 + brightness * 0.2 + vox * 0.2);
    ctx.lineWidth = (speaking ? 1.6 : 1.0) * scale;
    ctx.shadowBlur = (6 + vox * 14) * scale;
    ctx.stroke();

    // Traveling dots along the spiral
    for (let d = 0; d < 6; d++) {
      const dotAngle = t * speed + d * 1.4;
      const dotR = Math.pow(phi, dotAngle / (Math.PI * 2)) * 1.6 * scale;
      if (dotR < 4 * scale || dotR > 80 * scale) continue;
      const x = cx + Math.cos(dotAngle) * dotR;
      const y = cy + Math.sin(dotAngle) * dotR;
      ctx.beginPath();
      ctx.arc(x, y, ((speaking ? 2.5 : 1.8) + vox * 2) * scale, 0, Math.PI * 2);
      ctx.fillStyle = rgba(color, 0.7 + vox * 0.3);
      ctx.shadowBlur = (4 + vox * 10) * scale;
      ctx.fill();
    }

    // Cardinal star markers — N/E/S/W get a tiny diamond
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * 86 * scale;
      const y = cy + Math.sin(angle) * 86 * scale;
      ctx.beginPath();
      ctx.arc(x, y, (2 + vox * 1.5) * scale, 0, Math.PI * 2);
      ctx.fillStyle = rgba(color, 0.6 + vox * 0.3);
      ctx.shadowBlur = (4 + vox * 10) * scale;
      ctx.fill();
    }

    // Center beacon
    ctx.beginPath();
    ctx.arc(cx, cy, (4 + vox * 4) * scale, 0, Math.PI * 2);
    ctx.fillStyle = rgba(color, 0.55 + vox * 0.45);
    ctx.shadowBlur = (14 + vox * 24) * scale;
    ctx.fill();
  },

  // ─── HEALER (Florence Nightingale) — flower of life + heartbeat ───────
  // Adapted from Genesis: rafael
  healer: (ctx, w, h, t, color, vox, scale) => {
    const cx = w / 2, cy = h / 2;
    const speaking = vox > 0.04;
    const speed = 0.2 + vox * 1.0;
    const brightness = 0.4 + vox * 0.8;
    const petals = 6;

    ctx.shadowColor = color;

    // Flower of life — three rings of overlapping circles
    for (let ring = 0; ring < 3; ring++) {
      const ringRadius = (25 + ring * 20) * scale;
      for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2 + t * speed * 0.3;
        const px = cx + Math.cos(angle) * ringRadius * 0.5;
        const py = cy + Math.sin(angle) * ringRadius * 0.5;
        const breathe = Math.sin(t * (1 + vox * 2) + i * 0.5 + ring) * (2 + vox * 5) * scale;

        ctx.beginPath();
        ctx.arc(px, py, ringRadius * 0.5 + breathe, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(color, 0.1 + brightness * 0.12);
        ctx.lineWidth = 0.8 * scale;
        ctx.shadowBlur = (4 + vox * 12) * scale;
        ctx.stroke();
      }
    }

    // Center heartbeat — pulses with voice amplitude directly
    const heartbeat = (speaking
      ? Math.abs(Math.sin(t * 4)) * 6 + 8 + vox * 8
      : 8 + Math.sin(t) * 2) * scale;
    ctx.beginPath();
    ctx.arc(cx, cy, heartbeat, 0, Math.PI * 2);
    ctx.fillStyle = rgba(color, 0.2 + brightness * 0.4);
    ctx.shadowBlur = (16 + vox * 28) * scale;
    ctx.fill();

    // Ripple waves — appear when voice is present
    if (vox > 0.03) {
      for (let r = 0; r < 3; r++) {
        const rippleR = ((t * 30 + r * 30) % 80) + 10;
        const radius = rippleR * scale;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(color, (0.3 + vox * 0.2) * (1 - rippleR / 90));
        ctx.lineWidth = 1 * scale;
        ctx.stroke();
      }
    }
  },

  // ─── MONK (Thich Nhat Hanh) — concentric mandala + constellation ──────
  // Adapted from Genesis: archos (the rotating data-mandala — perfect for zen)
  monk: (ctx, w, h, t, color, vox, scale) => {
    const cx = w / 2, cy = h / 2;
    const speaking = vox > 0.04;
    const speed = 0.3 + vox * 1.2;
    const brightness = 0.5 + vox * 0.7;
    const rings = 5;

    ctx.shadowColor = color;

    for (let r = 0; r < rings; r++) {
      const radius = (20 + r * 15) * scale;
      const points = 6 + r * 2;
      const rotation = t * speed * (r % 2 === 0 ? 1 : -1) * 0.5;

      ctx.beginPath();
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2 + rotation;
        const wobble = Math.sin(t * 2 + r + i) * (1 + vox * 4) * scale;
        const x = cx + Math.cos(angle) * (radius + wobble);
        const y = cy + Math.sin(angle) * (radius + wobble);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = rgba(color, 0.15 + brightness * 0.15 - r * 0.02);
      ctx.lineWidth = (speaking ? 1.5 : 0.8) * scale;
      ctx.shadowBlur = (6 + vox * 12) * scale;
      ctx.stroke();

      // Constellation dots at each point
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2 + rotation;
        const x = cx + Math.cos(angle) * radius;
        const y = cy + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.arc(x, y, ((speaking ? 2.5 : 1.5) + vox * 1.5) * scale, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, 0.4 + brightness * 0.4);
        ctx.fill();
      }
    }

    // Center eye — breath dot
    ctx.beginPath();
    ctx.arc(cx, cy, (5 + Math.sin(t * 2) * 2 + vox * 4) * scale, 0, Math.PI * 2);
    ctx.fillStyle = rgba(color, 0.5 + vox * 0.4);
    ctx.shadowBlur = (16 + vox * 24) * scale;
    ctx.fill();
  },

  // ─── CRAFTSMAN (Feynman) — fractal tree (branching paths) ─────────────
  // Adapted from Genesis: sovereign — but the tree metaphor also fits
  // Feynman diagrams (branching paths) as well as it fits the architect.
  craftsman: (ctx, w, h, t, color, vox, scale) => {
    const cx = w / 2, cy = h / 2;
    const speaking = vox > 0.04;
    const speed = 0.3 + vox * 1.0;
    const brightness = 0.4 + vox * 0.8;

    ctx.shadowColor = color;
    ctx.shadowBlur = (4 + vox * 14) * scale;

    function drawBranch(x, y, angle, depth, maxDepth) {
      if (depth >= maxDepth) return;
      const len = (35 - depth * 6) * (0.8 + Math.sin(t * speed + depth) * 0.2) * scale;
      const sway = Math.sin(t * speed * 0.7 + depth * 0.8) * (0.05 + vox * 0.15);
      const nx = x + Math.cos(angle + sway) * len;
      const ny = y + Math.sin(angle + sway) * len;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = rgba(color, (0.25 - depth * 0.04) * brightness + 0.05);
      ctx.lineWidth = Math.max(0.5, 3 - depth * 0.6) * scale;
      ctx.stroke();

      // Leaf dots at the tips — voice-reactive
      if (depth >= maxDepth - 1) {
        ctx.beginPath();
        ctx.arc(nx, ny, ((speaking ? 3 : 2) + vox * 1.5) * scale, 0, Math.PI * 2);
        ctx.fillStyle = rgba(color, 0.4 + brightness * 0.3);
        ctx.fill();
      }

      const spread = 0.5 + Math.sin(t * 0.5) * 0.1;
      drawBranch(nx, ny, angle - spread, depth + 1, maxDepth);
      drawBranch(nx, ny, angle + spread, depth + 1, maxDepth);
    }

    // Upward tree from below center — depth scales slightly with voice
    const maxDepth = speaking ? 6 : 5;
    drawBranch(cx, cy + 30 * scale, -Math.PI / 2, 0, maxDepth);

    // Downward roots, dimmer
    ctx.globalAlpha = 0.4 + vox * 0.2;
    drawBranch(cx, cy + 30 * scale, Math.PI / 2, 0, maxDepth - 1);
    ctx.globalAlpha = 1;

    // Foundation circle — the trunk's anchor
    ctx.beginPath();
    ctx.arc(cx, cy + 30 * scale, (3 + vox * 3) * scale, 0, Math.PI * 2);
    ctx.fillStyle = rgba(color, 0.5 + vox * 0.4);
    ctx.shadowBlur = (12 + vox * 22) * scale;
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

    const audio = getAudioController();
    // Patterns assume size 200 baseline. scale = size / 200 makes radii,
    // line widths, and shadow blurs all responsive to the canvas size.
    const scale = size / 200;

    const draw = () => {
      const t = (Date.now() - startTime.current) / 1000;

      // Trail-fade gives motion blur — softer than a hard clear each frame.
      ctx.fillStyle = "rgba(6, 6, 10, 0.18)";
      ctx.fillRect(0, 0, size, size);

      // Reset shadow each frame (state leaks between strokes otherwise)
      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      const vox = audio ? audio.getAmplitude() : 0;
      const fn = PATTERNS[archetypeId] || PATTERNS.stoic;
      fn(ctx, size, size, t, color, vox, scale);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  // concept is accepted for backward-compat but unused — voice amplitude
  // (vox) replaces the binary speaking flag and the older concept modes.
  }, [archetypeId, color, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size, display: "block" }} />;
}
