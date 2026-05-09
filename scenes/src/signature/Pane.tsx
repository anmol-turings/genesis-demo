import React from 'react';
import {SVG_W, SVG_H} from './SignatureSVG';
import {COLORS} from './tokens';

type Props = {
  side: 'left' | 'right';
  children: React.ReactNode;
};

export const Pane: React.FC<Props> = ({side, children}) => {
  const tx = side === 'left' ? 0 : SVG_W / 2;
  return (
    <g transform={`translate(${tx} 0)`}>
      <clipPath id={`pane-${side}`}>
        <rect x={0} y={0} width={SVG_W / 2} height={SVG_H} />
      </clipPath>
      <g clipPath={`url(#pane-${side})`}>{children}</g>
    </g>
  );
};

export const PaneDivider: React.FC = () => (
  <line
    x1={SVG_W / 2}
    y1={20}
    x2={SVG_W / 2}
    y2={SVG_H - 20}
    stroke={COLORS.inkFaint}
    strokeWidth={1}
    strokeDasharray="4 6"
  />
);

export const PANE_W = SVG_W / 2;
export const PANE_H = SVG_H;
