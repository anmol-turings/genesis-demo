import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {EASE} from './easings';

// ═══════════════════════════════════════════════════════════════════════
// REVEAL — universal element entrance.
// Combines: opacity fade + slide-up + slight scale = "rises into being"
// Use this instead of plain opacity fade. It's 90% of "looks polished."
// ═══════════════════════════════════════════════════════════════════════
export const Reveal: React.FC<{
  startFrame: number;
  duration?: number;
  slide?: number;       // pixels the element rises from
  scale?: number;       // start scale (1.0 = no scale)
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  startFrame, duration = 22, slide = 14, scale = 0.96,
  children, style = {},
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame, [startFrame, startFrame + duration], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeOut},
  );
  const ty = interpolate(
    frame, [startFrame, startFrame + duration], [slide, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeOut},
  );
  const s = interpolate(
    frame, [startFrame, startFrame + duration], [scale, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeOut},
  );

  return (
    <div style={{
      ...style,
      opacity,
      transform: `translateY(${ty}px) scale(${s})`,
      transformOrigin: 'center',
    }}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// HOLD-AND-PULSE — element appears, holds, then pulses once for emphasis.
// The pulse is what your eye notices — 1.0 → 1.08 → 1.0 over ~12 frames.
// ═══════════════════════════════════════════════════════════════════════
export const RevealAndPulse: React.FC<{
  startFrame: number;
  pulseAt?: number;        // frames after reveal
  pulseStrength?: number;  // scale multiplier at peak
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({
  startFrame, pulseAt = 30, pulseStrength = 1.08,
  children, style = {},
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame, [startFrame, startFrame + 22], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeOut},
  );
  const ty = interpolate(
    frame, [startFrame, startFrame + 22], [12, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeOut},
  );

  const pulseStart = startFrame + pulseAt;
  const pulseScale = interpolate(
    frame,
    [pulseStart, pulseStart + 6, pulseStart + 14],
    [1, pulseStrength, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeInOut},
  );

  return (
    <div style={{
      ...style,
      opacity,
      transform: `translateY(${ty}px) scale(${pulseScale})`,
      transformOrigin: 'center',
    }}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════
// STAGGER — generates start-frame array for N items with constant delay.
// Use: const starts = stagger(5, 110, 8) → [110, 118, 126, 134, 142]
// ═══════════════════════════════════════════════════════════════════════
export const stagger = (count: number, baseFrame: number, gap: number) =>
  Array.from({length: count}).map((_, i) => baseFrame + i * gap);
