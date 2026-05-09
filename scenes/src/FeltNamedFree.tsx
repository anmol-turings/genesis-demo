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
  STROKE,
  TIMING,
} from './signature';

const Vapor: React.FC<{
  count: number;
  bounded: boolean;
  cx: number;
  startY: number;
  rangeY: number;
  color: string;
  drawAt: [number, number];
}> = ({count, bounded, cx, startY, rangeY, color, drawAt}) => {
  const frame = useCurrentFrame();
  const [s, e] = drawAt;
  return (
    <>
      {Array.from({length: count}).map((_, i) => {
        const t = (i / count + (frame % 90) / 90) % 1;
        const y = startY - t * rangeY;
        const opacity = bounded
          ? interpolate(t, [0, 0.5, 1], [0.1, 0.6, 0.1])
          : interpolate(t, [0, 0.4, 1], [0.0, 0.7, 0.0]);
        const x = cx + Math.sin(i * 1.7 + frame * 0.05) * (bounded ? 30 : 60);
        const reveal = interpolate(frame, [s, e], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        });
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={4}
            fill={color}
            opacity={opacity * reveal}
          />
        );
      })}
    </>
  );
};

export const FeltNamedFree: React.FC = () => {
  const cx = PANE_W / 2;
  const jarTop = 140;
  const jarBottom = PANE_H - 60;
  const jarW = 180;

  // Sealed jar: closed top
  const sealedPath = `
    M ${cx - jarW / 2} ${jarTop + 30}
    L ${cx - jarW / 2} ${jarBottom}
    Q ${cx - jarW / 2} ${jarBottom + 30} ${cx} ${jarBottom + 30}
    Q ${cx + jarW / 2} ${jarBottom + 30} ${cx + jarW / 2} ${jarBottom}
    L ${cx + jarW / 2} ${jarTop + 30}
    L ${cx + jarW / 2 + 14} ${jarTop + 30}
    L ${cx + jarW / 2 + 14} ${jarTop}
    L ${cx - jarW / 2 - 14} ${jarTop}
    L ${cx - jarW / 2 - 14} ${jarTop + 30}
    Z
  `;

  // Open vessel: no top, sides flared
  const openPath = `
    M ${cx - jarW / 2 - 20} ${jarTop}
    L ${cx - jarW / 2} ${jarBottom}
    Q ${cx - jarW / 2} ${jarBottom + 30} ${cx} ${jarBottom + 30}
    Q ${cx + jarW / 2} ${jarBottom + 30} ${cx + jarW / 2} ${jarBottom}
    L ${cx + jarW / 2 + 20} ${jarTop}
  `;

  return (
    <SignatureFrame
      visualSlot={
        <SignatureSVG>
          <Pane side="left">
            <DrawnPath
              d={sealedPath}
              tier="medium"
              color={COLORS.before}
              drawAt={[TIMING.before.start, TIMING.before.end]}
            />
            <Vapor
              count={14}
              bounded
              cx={cx}
              startY={jarBottom - 20}
              rangeY={jarBottom - jarTop - 70}
              color={COLORS.before}
              drawAt={[TIMING.before.start + 30, TIMING.before.end]}
            />
            <foreignObject x={cx - 110} y={30} width={220} height={36}>
              <SignatureLabel
                text="Suppressed"
                appearAt={TIMING.before.start + 36}
                color={COLORS.before}
                style={{textAlign: 'center'}}
              />
            </foreignObject>
          </Pane>

          <Pane side="right">
            <DrawnPath
              d={openPath}
              tier="medium"
              color={COLORS.after}
              drawAt={[TIMING.after.start, TIMING.after.end]}
            />
            <Vapor
              count={20}
              bounded={false}
              cx={cx}
              startY={jarBottom - 20}
              rangeY={jarBottom + 10}
              color={COLORS.after}
              drawAt={[TIMING.after.start + 20, TIMING.after.end]}
            />
            <foreignObject x={cx - 110} y={30} width={220} height={36}>
              <SignatureLabel
                text="Named"
                appearAt={TIMING.after.start + 36}
                color={COLORS.after}
                style={{textAlign: 'center'}}
              />
            </foreignObject>
          </Pane>

          <PaneDivider />
        </SignatureSVG>
      }
      typeSlot={<SignatureTitle title="Felt → named → free." />}
    >
      {null}
    </SignatureFrame>
  );
};
