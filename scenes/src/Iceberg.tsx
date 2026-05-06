import React from 'react';
import {
  AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate,
} from 'remotion';
import {
  PALETTE, EASE, SceneShell, RevealAndPulse, stagger,
} from './motion-kit';

// ─── WATER SURFACE — wavy line with horizon glow ─────────────────────────
const WaterSurface: React.FC<{cameraY: number; surfaceY: number}> = ({cameraY, surfaceY}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const points: string[] = [];
  for (let x = 0; x <= width; x += 6) {
    const y = surfaceY +
      Math.sin((x / 90) + frame / 38) * 4 +
      Math.sin((x / 28) + frame / 22) * 1.4;
    points.push(`${x},${y}`);
  }
  const pathD = `M ${points.join(' L ')}`;

  const opacity = interpolate(cameraY, [-50, 0, 200, 380], [1, 1, 0.5, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeInOut});

  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0, opacity}}>
      <defs>
        <linearGradient id="surfaceGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={PALETTE.gold} stopOpacity="0" />
          <stop offset="50%"  stopColor={PALETTE.gold} stopOpacity="0.18" />
          <stop offset="100%" stopColor={PALETTE.gold} stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={0} y={surfaceY - 36} width={width} height={72} fill="url(#surfaceGlow)" />
      <path d={pathD} stroke={PALETTE.gold} strokeWidth={1.6} fill="none" opacity={0.9}
        style={{filter: `drop-shadow(0 0 8px ${PALETTE.gold})`}} />
      <path d={pathD} stroke={PALETTE.goldLight} strokeWidth={0.6} fill="none" opacity={0.4}
        transform="translate(0,3)" />
    </svg>
  );
};

// ─── ICEBERG MASS ───────────────────────────────────────────────────────
const IcebergMass: React.FC<{cameraY: number; surfaceY: number}> = ({cameraY, surfaceY}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const cx = width * 0.5;
  const bob = Math.sin(frame / 60) * 1.5;

  const tipPath = `
    M ${cx - 42} ${surfaceY + bob}
    L ${cx - 18} ${surfaceY - 72 + bob}
    L ${cx + 4}  ${surfaceY - 95 + bob}
    L ${cx + 22} ${surfaceY - 78 + bob}
    L ${cx + 36} ${surfaceY - 30 + bob}
    L ${cx + 54} ${surfaceY + bob}
    Z
  `;

  // Underwater mass — wider than tall, so labels fit within frame.
  // ~3.5x wider than tip, ~4x taller than tip is enough to read as "hidden mass"
  const massPath = `
    M ${cx - 42}  ${surfaceY + bob}
    L ${cx - 130} ${surfaceY + 40 + bob}
    L ${cx - 230} ${surfaceY + 90 + bob}
    L ${cx - 295} ${surfaceY + 150 + bob}
    L ${cx - 320} ${surfaceY + 220 + bob}
    L ${cx - 295} ${surfaceY + 290 + bob}
    L ${cx - 220} ${surfaceY + 340 + bob}
    L ${cx - 90}  ${surfaceY + 365 + bob}
    L ${cx + 70}  ${surfaceY + 360 + bob}
    L ${cx + 200} ${surfaceY + 320 + bob}
    L ${cx + 290} ${surfaceY + 260 + bob}
    L ${cx + 320} ${surfaceY + 190 + bob}
    L ${cx + 305} ${surfaceY + 120 + bob}
    L ${cx + 230} ${surfaceY + 65 + bob}
    L ${cx + 130} ${surfaceY + 35 + bob}
    L ${cx + 54}  ${surfaceY + bob}
    Z
  `;

  const facets = [
    `M ${cx - 130} ${surfaceY + 40 + bob}  L ${cx - 50} ${surfaceY + 200 + bob}`,
    `M ${cx + 130} ${surfaceY + 35 + bob}  L ${cx + 60} ${surfaceY + 220 + bob}`,
    `M ${cx - 50}  ${surfaceY + 200 + bob} L ${cx + 60} ${surfaceY + 220 + bob}`,
    `M ${cx - 295} ${surfaceY + 290 + bob} L ${cx - 50} ${surfaceY + 200 + bob}`,
    `M ${cx + 230} ${surfaceY + 65 + bob}  L ${cx + 60} ${surfaceY + 220 + bob}`,
  ];

  const massOpacity = interpolate(cameraY, [0, 80, 200], [0, 0.85, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeOut});

  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="tipFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={PALETTE.iceWarm} stopOpacity="0.95" />
          <stop offset="100%" stopColor={PALETTE.iceWarm} stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="massFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={PALETTE.iceCool}   stopOpacity="0.7" />
          <stop offset="55%"  stopColor={PALETTE.iceCool}   stopOpacity="0.45" />
          <stop offset="100%" stopColor={PALETTE.iceShadow} stopOpacity="0.25" />
        </linearGradient>
        <radialGradient id="innerGlow" cx="0.5" cy="0.35" r="0.65">
          <stop offset="0%"   stopColor={PALETTE.iceWarm} stopOpacity="0.3" />
          <stop offset="100%" stopColor={PALETTE.iceWarm} stopOpacity="0" />
        </radialGradient>
      </defs>

      <g style={{opacity: massOpacity}}>
        <path d={massPath} fill="url(#massFill)" />
        <path d={massPath} fill="url(#innerGlow)" />
        {facets.map((d, i) => (
          <path key={i} d={d} stroke={PALETTE.iceCool} strokeWidth={0.5}
            fill="none" opacity={0.35} />
        ))}
        <path d={massPath} stroke={PALETTE.iceCool} strokeWidth={1.5}
          fill="none" opacity={0.65}
          style={{filter: `drop-shadow(0 0 16px ${PALETTE.iceWarm}50)`}} />
      </g>

      <g>
        <path d={tipPath} fill="url(#tipFill)" />
        <path d={tipPath} stroke={PALETTE.iceWarm} strokeWidth={1.6}
          fill="none"
          style={{filter: `drop-shadow(0 0 14px ${PALETTE.iceWarm})`}} />
      </g>
    </svg>
  );
};

// ─── GODRAYS ────────────────────────────────────────────────────────────
const Godrays: React.FC<{cameraY: number; surfaceY: number}> = ({cameraY, surfaceY}) => {
  const {width, height} = useVideoConfig();
  const opacity = interpolate(cameraY, [40, 120, 220, 400], [0, 0.35, 0.4, 0.2],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeInOut});
  if (opacity <= 0.01) return null;

  const rays = [
    {x: width * 0.20, w: 90,  rot: -8},
    {x: width * 0.40, w: 60,  rot: -3},
    {x: width * 0.55, w: 110, rot: 4},
    {x: width * 0.75, w: 80,  rot: 9},
  ];

  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0, opacity}}>
      <defs>
        <linearGradient id="rayGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={PALETTE.iceWarm} stopOpacity="0.4" />
          <stop offset="100%" stopColor={PALETTE.iceWarm} stopOpacity="0" />
        </linearGradient>
      </defs>
      {rays.map((r, i) => (
        <polygon
          key={i}
          points={`${r.x},${surfaceY} ${r.x - r.w/2},${surfaceY + 600} ${r.x + r.w/2},${surfaceY + 600}`}
          fill="url(#rayGrad)"
          transform={`rotate(${r.rot} ${r.x} ${surfaceY})`}
        />
      ))}
    </svg>
  );
};

// ─── DIMENSION LABELS ───────────────────────────────────────────────────
const DimensionLabels: React.FC<{surfaceY: number}> = ({surfaceY}) => {
  const {width} = useVideoConfig();
  const cx = width * 0.5;

  const starts = stagger(5, 110, 8);
  const labels = [
    {key: 'exhaustion',    val: '3.4', x: cx - 110, y: surfaceY + 100, start: starts[0]},
    {key: 'sleep_drift',   val: '3.6', x: cx + 100, y: surfaceY + 130, start: starts[1]},
    {key: 'alexithymia',   val: '3.2', x: cx - 30,  y: surfaceY + 200, start: starts[2]},
    {key: 'work_pressure', val: '4.4', x: cx + 130, y: surfaceY + 250, start: starts[3]},
    {key: 'loneliness',    val: '3.6', x: cx - 130, y: surfaceY + 290, start: starts[4]},
  ];

  return (
    <>
      {labels.map((lbl) => (
        <RevealAndPulse
          key={lbl.key}
          startFrame={lbl.start}
          pulseAt={45}
          pulseStrength={1.10}
          style={{
            position: 'absolute',
            left: lbl.x - 70, top: lbl.y - 12,
            width: 140, textAlign: 'center',
          }}
        >
          <div style={{
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 13, letterSpacing: 2,
            color: PALETTE.goldLight,
            textShadow: `0 0 8px ${PALETTE.goldLight}c0`,
          }}>{lbl.key}</div>
          <div style={{
            fontFamily: 'ui-monospace, "SF Mono", monospace',
            fontSize: 22, fontWeight: 600,
            color: PALETTE.cream, marginTop: 4,
            textShadow: `0 0 6px ${PALETTE.goldLight}, 0 0 16px ${PALETTE.gold}80`,
          }}>{lbl.val}</div>
        </RevealAndPulse>
      ))}
    </>
  );
};

// ─── CAPTIONS ───────────────────────────────────────────────────────────
const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();

  const topOpacity = interpolate(frame, [12, 28, 70, 88], [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeInOut});
  const topY = interpolate(frame, [70, 88], [0, -8],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeIn});

  const botOpacity = interpolate(frame, [200, 220], [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeOut});
  const botY = interpolate(frame, [200, 220], [10, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeOut});

  return (
    <>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: height * 0.25,
        textAlign: 'center', opacity: topOpacity,
        transform: `translateY(${topY}px)`,
      }}>
        <span style={{
          fontFamily: 'ui-monospace, monospace', fontSize: 14,
          color: PALETTE.goldDim, letterSpacing: 4,
          textTransform: 'uppercase',
        }}>what you see</span>
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: height * 0.06,
        textAlign: 'center', opacity: botOpacity,
        transform: `translateY(${botY}px)`,
      }}>
        <span style={{
          fontFamily: '"Cormorant Garamond", "Georgia", serif',
          fontSize: 22, fontStyle: 'italic',
          color: PALETTE.cream, letterSpacing: 1,
        }}>what has been happening</span>
      </div>
    </>
  );
};

// ─── MAIN ───────────────────────────────────────────────────────────────
export const Iceberg: React.FC = () => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();

  const cameraY = interpolate(
    frame,
    [0, 30, 95, 220, 240],
    [-10, -8, 165, 165, 150],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EASE.easeInOut},
  );

  const surfaceY = height * 0.32 + cameraY;

  return (
    <SceneShell
      background={PALETTE.void}
      particleColor={PALETTE.goldLight}
      particleCount={20}
      particleZone={{top: 0.5, bottom: 1.0}}
      particleOpacity={0.5}
      vignetteStrength={0.55}
      panY={-6}
      zoomTo={1.06}
    >
      <AbsoluteFill style={{
        background: `linear-gradient(to bottom,
          ${PALETTE.void} 0%,
          ${PALETTE.waterTop} 45%,
          ${PALETTE.waterDeep} 100%)`,
      }} />

      <Godrays cameraY={cameraY} surfaceY={surfaceY} />
      <IcebergMass cameraY={cameraY} surfaceY={surfaceY} />
      <WaterSurface cameraY={cameraY} surfaceY={surfaceY} />
      <DimensionLabels surfaceY={surfaceY} />
      <Captions />
    </SceneShell>
  );
};
