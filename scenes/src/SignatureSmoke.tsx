import React from 'react';
import {
  SignatureFrame,
  SignatureTitle,
  SignatureLabel,
  SignatureSVG,
  SVG_W,
  SVG_H,
  DrawnPath,
  COLORS,
  TIMING,
  DASH,
} from './signature';

export const SignatureSmoke: React.FC = () => {
  const cx = SVG_W / 2;
  const cy = SVG_H / 2;
  const beforePath = `M ${cx - 280} ${cy} Q ${cx} ${cy - 60} ${cx + 280} ${cy + 80}`;
  const afterPath = `M ${cx - 280} ${cy + 60} Q ${cx} ${cy - 120} ${cx + 280} ${cy - 200}`;

  return (
    <SignatureFrame
      visualSlot={
        <SignatureSVG>
          <DrawnPath
            d={beforePath}
            tier="thin"
            color={COLORS.before}
            drawAt={[TIMING.before.start, TIMING.before.end]}
            dash={DASH.before}
          />
          <DrawnPath
            d={afterPath}
            tier="heavy"
            color={COLORS.after}
            drawAt={[TIMING.after.start, TIMING.after.end]}
          />
          <foreignObject x={cx - 320} y={cy + 110} width={200} height={40}>
            <SignatureLabel
              text="Before"
              appearAt={TIMING.before.start + 6}
              color={COLORS.before}
            />
          </foreignObject>
          <foreignObject x={cx + 120} y={cy - 240} width={200} height={40}>
            <SignatureLabel
              text="After"
              appearAt={TIMING.after.start + 6}
              color={COLORS.after}
            />
          </foreignObject>
        </SignatureSVG>
      }
      typeSlot={
        <SignatureTitle
          title="Signature locked."
          subtitle="Frame, type, stroke, motion — uniform."
        />
      }
    >
      {null}
    </SignatureFrame>
  );
};
