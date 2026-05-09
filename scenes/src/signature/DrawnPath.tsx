import React, {useMemo, useRef, useState, useEffect} from 'react';
import {interpolate, useCurrentFrame, Easing} from 'remotion';
import {COLORS, STROKE} from './tokens';

type Tier = keyof typeof STROKE;

type Props = {
  d: string;
  tier?: Tier;
  color?: string;
  drawAt: [number, number];
  dash?: string;
  opacity?: number;
  fadeOut?: [number, number];
};

export const DrawnPath: React.FC<Props> = ({
  d,
  tier = 'medium',
  color = COLORS.ink,
  drawAt,
  dash,
  opacity = 1,
  fadeOut,
}) => {
  const ref = useRef<SVGPathElement>(null);
  const [length, setLength] = useState(0);
  const frame = useCurrentFrame();

  useEffect(() => {
    if (ref.current) {
      try {
        setLength(ref.current.getTotalLength());
      } catch {
        setLength(2000);
      }
    }
  }, [d]);

  const progress = interpolate(frame, drawAt, [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.22, 1, 0.36, 1),
  });

  const fade = fadeOut
    ? interpolate(frame, fadeOut, [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const dashArray = dash ? dash : `${length} ${length}`;
  const dashOffset = dash ? 0 : length * (1 - progress);

  return (
    <path
      ref={ref}
      d={d}
      stroke={color}
      strokeWidth={STROKE[tier]}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={dashArray}
      strokeDashoffset={dashOffset}
      opacity={opacity * fade * (dash ? progress : 1)}
    />
  );
};
