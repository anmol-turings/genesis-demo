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

const Marks: React.FC<{
  count: number;
  color: string;
  width: number;
  height: number;
  gap: number;
  baseY: number;
  centerX: number;
  drawAt: [number, number];
  tier: keyof typeof STROKE;
}> = ({count, color, width, height, gap, baseY, centerX, drawAt, tier}) => {
  const frame = useCurrentFrame();
  const [s, e] = drawAt;
  const span = e - s;
  return (
    <>
      {Array.from({length: count}).map((_, i) => {
        const stagger = (i / count) * span;
        const start = s + stagger;
        const end = start + Math.min(10, span / count + 6);
        const opacity = interpolate(frame, [start, end], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        });
        const y = baseY - i * (height + gap);
        return (
          <line
            key={i}
            x1={centerX - width / 2}
            x2={centerX + width / 2}
            y1={y}
            y2={y}
            stroke={color}
            strokeWidth={STROKE[tier]}
            strokeLinecap="round"
            opacity={opacity}
          />
        );
      })}
    </>
  );
};

export const WhoStays: React.FC = () => {
  const baseY = PANE_H - 40;

  return (
    <SignatureFrame
      visualSlot={
        <SignatureSVG>
          <Pane side="left">
            <Marks
              count={3}
              color={COLORS.before}
              width={140}
              height={6}
              gap={6}
              baseY={baseY}
              centerX={PANE_W / 2}
              drawAt={[TIMING.before.start, TIMING.before.start + 30]}
              tier="thin"
            />
            <foreignObject
              x={PANE_W / 2 - 100}
              y={baseY - 60}
              width={200}
              height={36}
            >
              <SignatureLabel
                text="Quits"
                appearAt={TIMING.before.start + 36}
                color={COLORS.before}
                style={{textAlign: 'center'}}
              />
            </foreignObject>
          </Pane>

          <Pane side="right">
            <Marks
              count={36}
              color={COLORS.after}
              width={200}
              height={6}
              gap={4}
              baseY={baseY}
              centerX={PANE_W / 2}
              drawAt={[TIMING.after.start, TIMING.after.end]}
              tier="medium"
            />
            <foreignObject
              x={PANE_W / 2 - 100}
              y={baseY - 380}
              width={200}
              height={36}
            >
              <SignatureLabel
                text="Returns"
                appearAt={TIMING.after.end - 12}
                color={COLORS.after}
                style={{textAlign: 'center'}}
              />
            </foreignObject>
          </Pane>

          <PaneDivider />
        </SignatureSVG>
      }
      typeSlot={<SignatureTitle title="Who stays, becomes." />}
    >
      {null}
    </SignatureFrame>
  );
};
