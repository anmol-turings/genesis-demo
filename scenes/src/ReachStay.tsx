import React from 'react';
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

const buildSawtooth = (steps: number): string => {
  const pad = 40;
  const w = PANE_W - pad * 2;
  const h = PANE_H - pad * 2 - 40;
  const baseY = PANE_H - pad - 20;
  const stepW = w / steps;
  const peakH = h * 0.55;

  let d = `M ${pad} ${baseY}`;
  for (let i = 0; i < steps; i++) {
    const x0 = pad + i * stepW;
    const xPeak = x0 + stepW * 0.4;
    const xEnd = x0 + stepW;
    d += ` L ${xPeak} ${baseY - peakH}`;
    d += ` L ${xEnd} ${baseY}`;
  }
  return d;
};

const buildStaircase = (steps: number): string => {
  const pad = 40;
  const w = PANE_W - pad * 2;
  const h = PANE_H - pad * 2 - 40;
  const baseY = PANE_H - pad - 20;
  const stepW = w / steps;
  const stepH = h / steps;

  let d = `M ${pad} ${baseY}`;
  for (let i = 0; i < steps; i++) {
    const x0 = pad + i * stepW;
    const xEnd = x0 + stepW;
    const yEnd = baseY - (i + 1) * stepH;
    d += ` L ${xEnd} ${baseY - i * stepH}`;
    d += ` L ${xEnd} ${yEnd}`;
  }
  return d;
};

export const ReachStay: React.FC = () => {
  const sawtooth = buildSawtooth(8);
  const staircase = buildStaircase(8);

  return (
    <SignatureFrame
      visualSlot={
        <SignatureSVG>
          <Pane side="left">
            <line
              x1={40}
              x2={PANE_W - 40}
              y1={PANE_H - 60}
              y2={PANE_H - 60}
              stroke={COLORS.inkFaint}
              strokeWidth={1}
            />
            <DrawnPath
              d={sawtooth}
              tier="thin"
              color={COLORS.before}
              drawAt={[TIMING.before.start, TIMING.before.end]}
            />
            <foreignObject x={PANE_W / 2 - 110} y={30} width={220} height={36}>
              <SignatureLabel
                text="Reached 8×"
                appearAt={TIMING.before.start + 30}
                color={COLORS.before}
                style={{textAlign: 'center'}}
              />
            </foreignObject>
          </Pane>

          <Pane side="right">
            <line
              x1={40}
              x2={PANE_W - 40}
              y1={PANE_H - 60}
              y2={PANE_H - 60}
              stroke={COLORS.inkFaint}
              strokeWidth={1}
            />
            <DrawnPath
              d={staircase}
              tier="heavy"
              color={COLORS.after}
              drawAt={[TIMING.after.start, TIMING.after.end]}
            />
            <foreignObject x={PANE_W / 2 - 110} y={30} width={220} height={36}>
              <SignatureLabel
                text="Stayed 8×"
                appearAt={TIMING.after.start + 30}
                color={COLORS.after}
                style={{textAlign: 'center'}}
              />
            </foreignObject>
          </Pane>

          <PaneDivider />
        </SignatureSVG>
      }
      typeSlot={<SignatureTitle title="Reach, then stay." />}
    >
      {null}
    </SignatureFrame>
  );
};
