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
  COLORS,
  STROKE,
  TIMING,
} from './signature';

const Spinner: React.FC<{
  cx: number;
  cy: number;
  r: number;
  appearAt: number;
  color: string;
}> = ({cx, cy, r, appearAt, color}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [appearAt, appearAt + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const rot = ((frame - appearAt) * 6) % 360;
  return (
    <g
      opacity={opacity}
      style={{
        transform: `rotate(${rot}deg)`,
        transformOrigin: `${cx}px ${cy}px`,
      }}
    >
      {Array.from({length: 12}).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        const x1 = cx + Math.cos(a) * r * 0.6;
        const y1 = cy + Math.sin(a) * r * 0.6;
        const x2 = cx + Math.cos(a) * r;
        const y2 = cy + Math.sin(a) * r;
        const fade = 0.2 + (i / 12) * 0.8;
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke={color}
            strokeWidth={STROKE.medium}
            strokeLinecap="round"
            opacity={fade}
          />
        );
      })}
    </g>
  );
};

const Tally: React.FC<{
  count: number;
  cols: number;
  cellW: number;
  cellH: number;
  baseX: number;
  baseY: number;
  color: string;
  drawAt: [number, number];
}> = ({count, cols, cellW, cellH, baseX, baseY, color, drawAt}) => {
  const frame = useCurrentFrame();
  const [s, e] = drawAt;
  return (
    <>
      {Array.from({length: count}).map((_, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = baseX + col * cellW;
        const y = baseY + row * cellH;
        const t = i / count;
        const start = s + t * (e - s);
        const opacity = interpolate(frame, [start, start + 8], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        });
        const isFifth = (i + 1) % 5 === 0;
        return (
          <g key={i} opacity={opacity}>
            {Array.from({length: 4}).map((_, j) => (
              <line
                key={j}
                x1={x + j * 4}
                x2={x + j * 4}
                y1={y}
                y2={y + cellH * 0.7}
                stroke={color}
                strokeWidth={STROKE.medium}
                strokeLinecap="round"
              />
            ))}
            {isFifth && (
              <line
                x1={x - 2}
                y1={y + cellH * 0.5}
                x2={x + 18}
                y2={y + cellH * 0.2}
                stroke={color}
                strokeWidth={STROKE.medium}
                strokeLinecap="round"
              />
            )}
          </g>
        );
      })}
    </>
  );
};

export const StopPreparing: React.FC = () => {
  const cx = PANE_W / 2;
  const cy = PANE_H / 2 - 30;

  return (
    <SignatureFrame
      visualSlot={
        <SignatureSVG>
          <Pane side="left">
            <Spinner
              cx={cx}
              cy={cy}
              r={90}
              appearAt={TIMING.before.start}
              color={COLORS.before}
            />
            <foreignObject x={cx - 110} y={PANE_H - 80} width={220} height={36}>
              <SignatureLabel
                text="Prepared"
                appearAt={TIMING.before.start + 30}
                color={COLORS.before}
                style={{textAlign: 'center'}}
              />
            </foreignObject>
          </Pane>

          <Pane side="right">
            <Tally
              count={90}
              cols={9}
              cellW={36}
              cellH={36}
              baseX={cx - (9 * 36) / 2 + 4}
              baseY={cy - (10 * 36) / 2}
              color={COLORS.after}
              drawAt={[TIMING.after.start, TIMING.after.end]}
            />
            <foreignObject x={cx - 110} y={PANE_H - 80} width={220} height={36}>
              <SignatureLabel
                text="Made"
                appearAt={TIMING.after.start + 30}
                color={COLORS.after}
                style={{textAlign: 'center'}}
              />
            </foreignObject>
          </Pane>

          <PaneDivider />
        </SignatureSVG>
      }
      typeSlot={<SignatureTitle title="Stop preparing. Make." />}
    >
      {null}
    </SignatureFrame>
  );
};
