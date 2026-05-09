import React from 'react';
import {interpolate, useCurrentFrame, Easing} from 'remotion';
import {
  SignatureFrame,
  SignatureTitle,
  SignatureLabel,
  SignatureSVG,
  Pane,
  PaneDivider,
  PANE_W,
  PANE_H,
  DrawnPath,
  COLORS,
  TIMING,
} from './signature';

const Rays: React.FC<{
  cx: number;
  cy: number;
  count: number;
  spread: number;
  endY: number;
  color: string;
  drawAt: [number, number];
  converge?: {x: number; y: number};
}> = ({cx, cy, count, spread, endY, color, drawAt, converge}) => {
  return (
    <>
      {Array.from({length: count}).map((_, i) => {
        const t = i / (count - 1);
        const angle = (t - 0.5) * spread;
        const xOnGround = cx + Math.tan(angle) * (endY - cy);
        const targetX = converge ? converge.x : xOnGround;
        const targetY = converge ? converge.y : endY;
        const stagger = drawAt[0] + (i / count) * 8;
        return (
          <DrawnPath
            key={i}
            d={`M ${cx} ${cy + 30} L ${targetX} ${targetY}`}
            tier="thin"
            color={color}
            drawAt={[stagger, stagger + 30]}
            opacity={0.85}
          />
        );
      })}
    </>
  );
};

const Flame: React.FC<{x: number; y: number; appearAt: number}> = ({
  x,
  y,
  appearAt,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [appearAt, appearAt + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const pulse = 1 + Math.sin(frame * 0.4) * 0.08;
  return (
    <g opacity={opacity}>
      <circle cx={x} cy={y} r={32 * pulse} fill={COLORS.accent} opacity={0.25} />
      <circle cx={x} cy={y} r={18 * pulse} fill={COLORS.after} opacity={0.7} />
      <circle cx={x} cy={y} r={8 * pulse} fill={COLORS.ink} />
    </g>
  );
};

export const FocusBurns: React.FC = () => {
  const sunY = 80;
  const groundY = PANE_H - 80;

  return (
    <SignatureFrame
      visualSlot={
        <SignatureSVG>
          <Pane side="left">
            <line
              x1={40}
              x2={PANE_W - 40}
              y1={groundY}
              y2={groundY}
              stroke={COLORS.inkFaint}
              strokeWidth={1}
            />
            <circle
              cx={PANE_W / 2}
              cy={sunY}
              r={32}
              fill={COLORS.before}
              opacity={0.9}
            />
            <Rays
              cx={PANE_W / 2}
              cy={sunY}
              count={11}
              spread={1.4}
              endY={groundY}
              color={COLORS.before}
              drawAt={[TIMING.before.start, TIMING.before.end]}
            />
            <foreignObject x={PANE_W / 2 - 110} y={groundY + 16} width={220} height={36}>
              <SignatureLabel
                text="Scattered"
                appearAt={TIMING.before.start + 36}
                color={COLORS.before}
                style={{textAlign: 'center'}}
              />
            </foreignObject>
          </Pane>

          <Pane side="right">
            <line
              x1={40}
              x2={PANE_W - 40}
              y1={groundY}
              y2={groundY}
              stroke={COLORS.inkFaint}
              strokeWidth={1}
            />
            <circle
              cx={PANE_W / 2}
              cy={sunY}
              r={32}
              fill={COLORS.after}
            />
            {/* Lens */}
            <ellipse
              cx={PANE_W / 2}
              cy={(sunY + groundY) / 2}
              rx={70}
              ry={20}
              fill="none"
              stroke={COLORS.ink}
              strokeWidth={3}
              opacity={0.85}
            />
            <Rays
              cx={PANE_W / 2}
              cy={sunY}
              count={11}
              spread={1.0}
              endY={groundY}
              color={COLORS.after}
              drawAt={[TIMING.after.start, TIMING.after.end]}
              converge={{x: PANE_W / 2, y: groundY - 8}}
            />
            <Flame
              x={PANE_W / 2}
              y={groundY - 8}
              appearAt={TIMING.after.end - 20}
            />
            <foreignObject x={PANE_W / 2 - 110} y={groundY + 16} width={220} height={36}>
              <SignatureLabel
                text="Focused"
                appearAt={TIMING.after.start + 36}
                color={COLORS.after}
                style={{textAlign: 'center'}}
              />
            </foreignObject>
          </Pane>

          <PaneDivider />
        </SignatureSVG>
      }
      typeSlot={<SignatureTitle title="Focus is what makes attention burn." />}
    >
      {null}
    </SignatureFrame>
  );
};
