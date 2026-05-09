import React from 'react';
import {LAYOUT} from './tokens';

type Props = {
  children: React.ReactNode;
};

export const SignatureSVG: React.FC<Props> = ({children}) => {
  const w = LAYOUT.cardSize - LAYOUT.cardPadding * 2;
  const h = (LAYOUT.cardSize * LAYOUT.visualRegionRatio) - LAYOUT.cardPadding;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
    >
      {children}
    </svg>
  );
};

export const SVG_W = LAYOUT.cardSize - LAYOUT.cardPadding * 2;
export const SVG_H = LAYOUT.cardSize * LAYOUT.visualRegionRatio - LAYOUT.cardPadding;
