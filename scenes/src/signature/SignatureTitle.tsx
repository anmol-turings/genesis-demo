import React from 'react';
import {interpolate, useCurrentFrame, Easing} from 'remotion';
import {COLORS, TYPE, TIMING} from './tokens';

type Props = {
  title: string;
  subtitle?: string;
};

export const SignatureTitle: React.FC<Props> = ({title, subtitle}) => {
  const frame = useCurrentFrame();
  const {start, end} = TIMING.titleIn;

  const opacity = interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });
  const y = interpolate(frame, [start, end], [12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const subOpacity = interpolate(frame, [start + 6, end + 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  return (
    <div style={{transform: `translateY(${y}px)`, opacity}}>
      <div
        style={{
          fontSize: TYPE.title.size,
          fontWeight: TYPE.title.weight,
          letterSpacing: TYPE.title.tracking,
          color: COLORS.ink,
          lineHeight: 1.05,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            marginTop: 14,
            fontSize: TYPE.subtitle.size,
            fontWeight: TYPE.subtitle.weight,
            color: COLORS.inkDim,
            opacity: subOpacity,
            lineHeight: 1.2,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
