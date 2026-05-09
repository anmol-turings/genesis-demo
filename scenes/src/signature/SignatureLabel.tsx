import React from 'react';
import {interpolate, useCurrentFrame, Easing} from 'remotion';
import {COLORS, TYPE} from './tokens';

type Props = {
  text: string;
  appearAt: number;
  duration?: number;
  color?: string;
  style?: React.CSSProperties;
};

export const SignatureLabel: React.FC<Props> = ({
  text,
  appearAt,
  duration = 18,
  color = COLORS.inkDim,
  style,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [appearAt, appearAt + duration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    }
  );
  const y = interpolate(frame, [appearAt, appearAt + duration], [8, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  return (
    <div
      style={{
        fontSize: TYPE.label.size,
        fontWeight: TYPE.label.weight,
        letterSpacing: TYPE.label.tracking,
        textTransform: 'uppercase',
        color,
        opacity,
        transform: `translateY(${y}px)`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};
