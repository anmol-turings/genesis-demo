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

// Simple stick figure builder
const StickFigure: React.FC<{
  cx: number;
  groundY: number;
  scale?: number;
  color: string;
  pose: 'punch' | 'walk';
  flip?: boolean;
  appearAt: number;
}> = ({cx, groundY, scale = 1, color, pose, flip = false, appearAt}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [appearAt, appearAt + 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const headR = 14 * scale;
  const torsoH = 70 * scale;
  const legH = 80 * scale;
  const armL = 50 * scale;
  const headCY = groundY - legH - torsoH - headR;
  const shoulderY = groundY - legH - torsoH + 10 * scale;
  const hipY = groundY - legH;
  const f = flip ? -1 : 1;

  // Arm positions per pose
  const armAngle = pose === 'punch' ? -0.1 : 0.4; // raised punch vs swinging
  const armSwing = pose === 'walk' ? Math.sin(frame * 0.15) * 0.3 : 0;
  const ax = cx + Math.cos(armAngle + armSwing) * armL * f;
  const ay = shoulderY + Math.sin(armAngle + armSwing) * armL * 0.6;

  // Leg
  const legSwing = pose === 'walk' ? Math.sin(frame * 0.15) * 0.4 : 0.15;
  const lx1 = cx + Math.sin(legSwing) * legH * 0.4 * f;
  const lx2 = cx - Math.sin(legSwing) * legH * 0.4 * f;
  return (
    <g opacity={opacity}>
      <circle cx={cx} cy={headCY} r={headR} fill={color} />
      <line
        x1={cx}
        y1={shoulderY - 4 * scale}
        x2={cx}
        y2={hipY}
        stroke={color}
        strokeWidth={STROKE.heavy}
        strokeLinecap="round"
      />
      {/* punching arm or front arm */}
      <line
        x1={cx}
        y1={shoulderY}
        x2={ax}
        y2={ay}
        stroke={color}
        strokeWidth={STROKE.medium}
        strokeLinecap="round"
      />
      {/* trailing arm */}
      <line
        x1={cx}
        y1={shoulderY}
        x2={cx - 30 * scale * f}
        y2={shoulderY + 30 * scale}
        stroke={color}
        strokeWidth={STROKE.medium}
        strokeLinecap="round"
        opacity={0.6}
      />
      {/* legs */}
      <line
        x1={cx}
        y1={hipY}
        x2={lx1}
        y2={groundY}
        stroke={color}
        strokeWidth={STROKE.medium}
        strokeLinecap="round"
      />
      <line
        x1={cx}
        y1={hipY}
        x2={lx2}
        y2={groundY}
        stroke={color}
        strokeWidth={STROKE.medium}
        strokeLinecap="round"
      />
    </g>
  );
};

// A shadow rendered as a flatter, semi-transparent figure beneath/beside
const Shadow: React.FC<{
  cx: number;
  groundY: number;
  scale?: number;
  pose: 'punch' | 'walk';
  flip?: boolean;
  appearAt: number;
  color?: string;
}> = ({cx, groundY, scale = 1, pose, flip = false, appearAt, color = COLORS.inkFaint}) => {
  return (
    <g opacity={0.55}>
      <StickFigure
        cx={cx}
        groundY={groundY}
        scale={scale}
        color={color}
        pose={pose}
        flip={flip}
        appearAt={appearAt}
      />
    </g>
  );
};

export const WalksLighter: React.FC = () => {
  const groundY = PANE_H - 60;

  // Tension lines for fight
  const tensionLines = [
    `M ${PANE_W / 2 - 80} 80 L ${PANE_W / 2 - 60} 100`,
    `M ${PANE_W / 2 + 80} 80 L ${PANE_W / 2 + 60} 100`,
    `M ${PANE_W / 2} 60 L ${PANE_W / 2} 90`,
  ];

  return (
    <SignatureFrame
      visualSlot={
        <SignatureSVG>
          <Pane side="left">
            <line
              x1={20}
              x2={PANE_W - 20}
              y1={groundY}
              y2={groundY}
              stroke={COLORS.inkFaint}
              strokeWidth={1}
            />
            {/* Figure punching */}
            <StickFigure
              cx={PANE_W / 2 - 60}
              groundY={groundY}
              color={COLORS.before}
              pose="punch"
              appearAt={TIMING.before.start}
            />
            {/* Shadow opposite, also punching */}
            <Shadow
              cx={PANE_W / 2 + 60}
              groundY={groundY}
              pose="punch"
              flip
              appearAt={TIMING.before.start + 6}
              color={COLORS.before}
            />
            {tensionLines.map((d, i) => (
              <DrawnPath
                key={i}
                d={d}
                tier="thin"
                color={COLORS.accent}
                drawAt={[
                  TIMING.before.start + 30 + i * 6,
                  TIMING.before.start + 50 + i * 6,
                ]}
              />
            ))}
            <foreignObject x={PANE_W / 2 - 110} y={20} width={220} height={36}>
              <SignatureLabel
                text="Fights"
                appearAt={TIMING.before.start + 30}
                color={COLORS.before}
                style={{textAlign: 'center'}}
              />
            </foreignObject>
          </Pane>

          <Pane side="right">
            <line
              x1={20}
              x2={PANE_W - 20}
              y1={groundY}
              y2={groundY}
              stroke={COLORS.inkFaint}
              strokeWidth={1}
            />
            {/* Figure walking */}
            <StickFigure
              cx={PANE_W / 2 - 30}
              groundY={groundY}
              color={COLORS.after}
              pose="walk"
              appearAt={TIMING.after.start}
            />
            {/* Shadow walking alongside */}
            <Shadow
              cx={PANE_W / 2 + 30}
              groundY={groundY}
              pose="walk"
              appearAt={TIMING.after.start + 6}
              color={COLORS.after}
            />
            <foreignObject x={PANE_W / 2 - 110} y={20} width={220} height={36}>
              <SignatureLabel
                text="Walks"
                appearAt={TIMING.after.start + 30}
                color={COLORS.after}
                style={{textAlign: 'center'}}
              />
            </foreignObject>
          </Pane>

          <PaneDivider />
        </SignatureSVG>
      }
      typeSlot={<SignatureTitle title="It walks lighter beside you." />}
    >
      {null}
    </SignatureFrame>
  );
};
