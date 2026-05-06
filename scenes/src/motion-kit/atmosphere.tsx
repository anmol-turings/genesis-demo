import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, random} from 'remotion';
import {PALETTE} from './palette';
import {EASE} from './easings';

// ═══════════════════════════════════════════════════════════════════════
// VIGNETTE — soft edge darkening that pulls the eye to center.
// Always-on. Subtle. ~0.3-0.5 strength reads as "cinematic" without
// being heavy-handed.
// ═══════════════════════════════════════════════════════════════════════
export const Vignette: React.FC<{strength?: number; color?: string}> = ({
  strength = 0.45,
  color = PALETTE.void,
}) => (
  <AbsoluteFill style={{
    pointerEvents: 'none',
    background: `radial-gradient(ellipse at center,
      transparent 40%,
      ${color}${Math.round(strength * 255).toString(16).padStart(2, '0')} 100%)`,
  }} />
);

// ═══════════════════════════════════════════════════════════════════════
// ATMOSPHERIC PARTICLES — generic floating dust system.
// Drives the "alive" feeling under everything. Deterministic via seed.
// Pass color, count, drift speed for scene-specific tuning.
// ═══════════════════════════════════════════════════════════════════════
export const AtmosphericParticles: React.FC<{
  count?: number;
  color?: string;
  driftSpeed?: number;
  size?: number;
  opacity?: number;
  seed?: number;
  zone?: {top: number; bottom: number};   // 0..1 fractions of frame
}> = ({
  count = 30,
  color = PALETTE.goldLight,
  driftSpeed = 1,
  size = 1.6,
  opacity = 0.5,
  seed = 1,
  zone = {top: 0, bottom: 1},
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  // Each particle has stable random characteristics.
  const particles = Array.from({length: count}).map((_, i) => {
    const r1 = random(`p-${seed}-${i}-x`);
    const r2 = random(`p-${seed}-${i}-y`);
    const r3 = random(`p-${seed}-${i}-s`);
    const r4 = random(`p-${seed}-${i}-d`);
    const r5 = random(`p-${seed}-${i}-a`);

    const baseX = r1 * width;
    const yMin = zone.top * height;
    const yMax = zone.bottom * height;
    const baseY = yMin + r2 * (yMax - yMin);

    // Slow vertical drift (rises) + horizontal sway
    const vy = (r4 * 0.6 + 0.3) * driftSpeed;
    const sway = Math.sin(frame / 60 + i * 0.7) * 6;
    const y = baseY - (frame * vy * 0.3) % (yMax - yMin);
    const x = baseX + sway;

    return {
      x, y,
      size: size * (0.5 + r3 * 1.0),
      alpha: opacity * (0.4 + r5 * 0.6),
    };
  });

  return (
    <svg
      width={width} height={height}
      style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}
    >
      {particles.map((p, i) => (
        <circle
          key={i}
          cx={p.x} cy={p.y} r={p.size}
          fill={color} opacity={p.alpha}
          style={{filter: `drop-shadow(0 0 ${p.size * 2}px ${color})`}}
        />
      ))}
    </svg>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// SCENE FADE — subtle fade in and fade out at frame edges so loops
// don't have hard cuts. Almost everything benefits from this.
// ═══════════════════════════════════════════════════════════════════════
export const SceneFade: React.FC<{
  fadeInFrames?: number;
  fadeOutFrames?: number;
  children: React.ReactNode;
}> = ({fadeInFrames = 12, fadeOutFrames = 18, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const fadeIn = interpolate(frame, [0, fadeInFrames], [0.4, 1], {
    extrapolateRight: 'clamp', easing: EASE.easeOut,
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - fadeOutFrames, durationInFrames],
    [1, 0.4],
    {extrapolateLeft: 'clamp', easing: EASE.easeIn},
  );
  return (
    <AbsoluteFill style={{opacity: Math.min(fadeIn, fadeOut)}}>
      {children}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// KEN BURNS — slow continuous camera drift. Adds life to static frames.
// Direction can be 'in', 'out', or specific angle in degrees.
// ═══════════════════════════════════════════════════════════════════════
export const KenBurns: React.FC<{
  zoomFrom?: number;
  zoomTo?: number;
  panX?: number;       // pixels of horizontal drift over full duration
  panY?: number;       // pixels of vertical drift over full duration
  children: React.ReactNode;
}> = ({zoomFrom = 1.0, zoomTo = 1.05, panX = 0, panY = -10, children}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const t = frame / durationInFrames;
  const scale = zoomFrom + (zoomTo - zoomFrom) * t;
  const tx = panX * t;
  const ty = panY * t;
  return (
    <AbsoluteFill style={{
      transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
      transformOrigin: 'center',
    }}>
      {children}
    </AbsoluteFill>
  );
};
