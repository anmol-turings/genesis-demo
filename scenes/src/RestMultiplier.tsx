import React from 'react';
import {interpolate, useCurrentFrame, Easing} from 'remotion';
import {
  SignatureFrame,
  SignatureTitle,
  SignatureSVG,
  SVG_W,
  SVG_H,
  COLORS,
  TYPE,
  TIMING,
} from './signature';

const Token: React.FC<{
  text: string;
  color: string;
  weight: number;
  appearAt: number;
  size: number;
}> = ({text, color, weight, appearAt, size}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [appearAt, appearAt + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const y = interpolate(frame, [appearAt, appearAt + 18], [10, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  return (
    <span
      style={{
        color,
        fontWeight: weight,
        fontSize: size,
        opacity,
        transform: `translateY(${y}px)`,
        display: 'inline-block',
        letterSpacing: '-0.01em',
        whiteSpace: 'pre',
      }}
    >
      {text}
    </span>
  );
};

type Part = {text: string; color: string; weight: number};

const Equation: React.FC<{
  parts: Part[];
  appearAt: number;
  size: number;
  opacity?: number;
}> = ({parts, appearAt, size, opacity = 1}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.55em',
        fontFamily: TYPE.family,
        opacity,
      }}
    >
      {parts.map((p, i) => (
        <Token
          key={i}
          text={p.text}
          color={p.color}
          weight={p.weight}
          appearAt={appearAt + i * 6}
          size={size}
        />
      ))}
    </div>
  );
};

export const RestMultiplier: React.FC = () => {
  const cy = SVG_H / 2;
  const eqW = SVG_W;
  const eqH = 110;
  const size = 78;

  return (
    <SignatureFrame
      visualSlot={
        <SignatureSVG>
          <foreignObject
            x={0}
            y={cy - 130}
            width={eqW}
            height={eqH}
          >
            <Equation
              size={size}
              appearAt={TIMING.before.start}
              opacity={0.7}
              parts={[
                {text: 'effort', color: COLORS.before, weight: 500},
                {text: '×', color: COLORS.inkFaint, weight: 400},
                {text: '0', color: COLORS.before, weight: 500},
                {text: '=', color: COLORS.inkFaint, weight: 400},
                {text: '0', color: COLORS.before, weight: 500},
              ]}
            />
          </foreignObject>

          <foreignObject
            x={0}
            y={cy + 30}
            width={eqW}
            height={eqH}
          >
            <Equation
              size={size}
              appearAt={TIMING.after.start}
              parts={[
                {text: 'effort', color: COLORS.ink, weight: 700},
                {text: '×', color: COLORS.inkDim, weight: 400},
                {text: 'rest', color: COLORS.after, weight: 700},
                {text: '=', color: COLORS.inkDim, weight: 400},
                {text: 'output', color: COLORS.after, weight: 700},
              ]}
            />
          </foreignObject>

          {/* Strike-through for the zeroed equation, drawn at after.start */}
          <Strike y={cy - 78} appearAt={TIMING.after.start - 12} />
        </SignatureSVG>
      }
      typeSlot={<SignatureTitle title="Rest is the multiplier." />}
    >
      {null}
    </SignatureFrame>
  );
};

const Strike: React.FC<{y: number; appearAt: number}> = ({y, appearAt}) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [appearAt, appearAt + 24], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const x1 = SVG_W * 0.18;
  const x2 = SVG_W * 0.82;
  return (
    <line
      x1={x1}
      y1={y}
      x2={x1 + (x2 - x1) * t}
      y2={y}
      stroke={COLORS.before}
      strokeWidth={3}
      strokeLinecap="round"
      opacity={0.5 * t}
    />
  );
};
