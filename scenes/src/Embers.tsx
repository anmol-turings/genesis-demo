import React from 'react';
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate,
} from 'remotion';
import {
  PALETTE, EASE, SceneShell,
} from './motion-kit';

// ─── EMBER DEFINITIONS ─────────────────────────────────────────────────
// Twelve hand-placed embers, all inside the center 60% of the frame.
// Index 0 is the center; the other 11 ring it loosely. Positions are
// deterministic; no Math.random in the render path. flickerPhase shifts
// each ember's flicker so they don't pulse in lockstep.
type EmberDef = {
  cx: number;             // fraction of width
  cy: number;             // fraction of height
  flickerPeriod: number;  // frames per cycle (42–72 → 1.4–2.4s @ 30fps)
  flickerPhase: number;   // 0..1
  baseOpacity: number;    // 0.45–1.0
};

const EMBERS: EmberDef[] = [
  { cx: 0.50, cy: 0.50, flickerPeriod: 50, flickerPhase: 0.00, baseOpacity: 1.00 }, // 0 center
  { cx: 0.30, cy: 0.32, flickerPeriod: 60, flickerPhase: 0.18, baseOpacity: 0.78 }, // 1
  { cx: 0.42, cy: 0.27, flickerPeriod: 48, flickerPhase: 0.42, baseOpacity: 0.72 }, // 2
  { cx: 0.63, cy: 0.30, flickerPeriod: 54, flickerPhase: 0.71, baseOpacity: 0.85 }, // 3 ← gust brightens
  { cx: 0.74, cy: 0.40, flickerPeriod: 56, flickerPhase: 0.06, baseOpacity: 0.65 }, // 4
  { cx: 0.78, cy: 0.56, flickerPeriod: 64, flickerPhase: 0.85, baseOpacity: 0.55 }, // 5
  { cx: 0.66, cy: 0.69, flickerPeriod: 50, flickerPhase: 0.33, baseOpacity: 0.78 }, // 6
  { cx: 0.50, cy: 0.75, flickerPeriod: 46, flickerPhase: 0.59, baseOpacity: 0.72 }, // 7
  { cx: 0.34, cy: 0.66, flickerPeriod: 52, flickerPhase: 0.21, baseOpacity: 0.62 }, // 8
  { cx: 0.24, cy: 0.50, flickerPeriod: 60, flickerPhase: 0.78, baseOpacity: 0.85 }, // 9 ← gust dims
  { cx: 0.37, cy: 0.45, flickerPeriod: 70, flickerPhase: 0.50, baseOpacity: 0.55 }, // 10
  { cx: 0.59, cy: 0.46, flickerPeriod: 44, flickerPhase: 0.27, baseOpacity: 0.70 }, // 11 nearest neighbor
];

const NEIGHBOR_INDEX = 11; // the ember the center finally reaches toward

// ─── ONE EMBER ─────────────────────────────────────────────────────────
const Ember: React.FC<{
  ember: EmberDef;
  index: number;
  width: number;
  height: number;
  revealOpacity: number; // 0..1, gates the surrounding embers
}> = ({ember, index, width, height, revealOpacity}) => {
  const frame = useCurrentFrame();
  const cx = ember.cx * width;
  const cy = ember.cy * height;
  const isCenter = index === 0;

  // Flicker — sin between 0.45 and 1.0 of base.
  const phase = ember.flickerPhase * ember.flickerPeriod;
  const flicker = (Math.sin(((frame + phase) / ember.flickerPeriod) * Math.PI * 2) + 1) / 2;
  const flickerScalar = 0.45 + 0.55 * flicker;

  // Beat 3 — wind gust on indices 3 and 9.
  let gustMul = 1;
  let gustBoost = 0;
  if (index === 9) {
    gustMul = interpolate(frame, [105, 135], [1, 0],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeInOut});
  }
  if (index === 3) {
    gustBoost = interpolate(frame, [110, 122, 135], [0, 0.7, 0],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeInOut});
  }

  // Beat 4 — center intensifies in the final third.
  let centerBoost = 0;
  if (isCenter) {
    centerBoost = interpolate(frame, [165, 195], [0, 0.35],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeInOut});
  }

  const visible = ember.baseOpacity * flickerScalar * gustMul + gustBoost + centerBoost;
  const opacity = Math.max(0, Math.min(1.4, visible)) * revealOpacity;

  const radius = isCenter ? 11 : 7;
  const glowAmp = 1 + (isCenter ? centerBoost * 0.8 : 0);

  return (
    <g style={{opacity}}>
      <circle cx={cx} cy={cy} r={radius * 2.6}
        fill={PALETTE.ember} opacity={0.18 * glowAmp}
        style={{filter: `blur(${radius * 1.4}px)`}} />
      <circle cx={cx} cy={cy} r={radius * 1.4}
        fill={PALETTE.ember} opacity={0.55 * glowAmp}
        style={{filter: `blur(${radius * 0.5}px)`}} />
      <circle cx={cx} cy={cy} r={radius * 0.55}
        fill={PALETTE.emberCore} opacity={0.95} />
    </g>
  );
};

// ─── THE LINE OF LIGHT ─────────────────────────────────────────────────
// Painted via stroke-dasharray from frame 165 to 195, from the center
// ember (index 0) to its nearest visible neighbor (index 11).
const ConnectingLine: React.FC<{width: number; height: number}> = ({width, height}) => {
  const frame = useCurrentFrame();
  const a = EMBERS[0];
  const b = EMBERS[NEIGHBOR_INDEX];
  const x1 = a.cx * width;
  const y1 = a.cy * height;
  const x2 = b.cx * width;
  const y2 = b.cy * height;
  const total = Math.hypot(x2 - x1, y2 - y1);

  const drawT = interpolate(frame, [165, 195], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeInOut});
  const drawn = drawT * total;

  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
      <defs>
        <linearGradient id="emberLine" x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={PALETTE.emberCore} stopOpacity="1" />
          <stop offset="100%" stopColor={PALETTE.ember}     stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="url(#emberLine)" strokeWidth={1.6}
        strokeDasharray={`${drawn} ${total}`}
        opacity={drawT > 0 ? 0.9 : 0}
        style={{filter: `drop-shadow(0 0 6px ${PALETTE.ember})`}}
      />
    </svg>
  );
};

// ─── COMPOSITION ───────────────────────────────────────────────────────
export const Embers: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  // Beat 2 — camera pulls back from 1.15 → 1.0 over frames 45–105.
  const cameraScale = interpolate(frame, [0, 45, 105, 210], [1.15, 1.15, 1.0, 1.0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeInOut});

  // Beat 1 → Beat 2 — surrounding embers fade in via stagger(11, 50, 6).
  const surroundingReveal = (i: number) => {
    const start = 50 + (i - 1) * 6; // i in 1..11
    return interpolate(frame, [start, start + 22], [0, 1],
      {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeOut});
  };

  return (
    <SceneShell
      background={PALETTE.void}
      particleColor={PALETTE.ember}
      particleCount={24}
      particleZone={{top: 0, bottom: 1}}
      particleOpacity={0.35}
      vignetteStrength={0.6}
      showKenBurns={false}
    >
      {/* The cold, surrounding dark — realm blue is the night around the embers. */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at center,
          ${PALETTE.waterTop} 0%,
          ${PALETTE.void} 70%)`,
      }} />

      {/* Hint of cold realm-blue at the very edges, so the warm embers read as warm. */}
      <AbsoluteFill style={{
        background: `radial-gradient(ellipse at center,
          transparent 50%,
          ${PALETTE.withdrawn}22 100%)`,
        mixBlendMode: 'screen',
      }} />

      <AbsoluteFill style={{
        transform: `scale(${cameraScale})`,
        transformOrigin: 'center',
      }}>
        <svg width={width} height={height} style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
          {/* Surrounding 11 embers — gated by reveal */}
          {EMBERS.map((ember, i) => {
            if (i === 0) return null;
            return (
              <Ember
                key={i}
                ember={ember}
                index={i}
                width={width}
                height={height}
                revealOpacity={surroundingReveal(i)}
              />
            );
          })}
          {/* Center ember — always present from frame 0 */}
          <Ember ember={EMBERS[0]} index={0} width={width} height={height} revealOpacity={1} />
        </svg>

        <ConnectingLine width={width} height={height} />
      </AbsoluteFill>
    </SceneShell>
  );
};
