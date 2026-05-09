import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, LAYOUT} from './tokens';
import {Grain} from './grain';

type Props = {
  children: React.ReactNode;
  visualSlot?: React.ReactNode;
  typeSlot?: React.ReactNode;
};

export const SignatureFrame: React.FC<Props> = ({
  children,
  visualSlot,
  typeSlot,
}) => {
  const inner = LAYOUT.cardSize;
  const visualH = inner * LAYOUT.visualRegionRatio;
  const typeH = inner * LAYOUT.typeRegionRatio;

  return (
    <AbsoluteFill
      style={{
        background: COLORS.bgOuter,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <AbsoluteFill
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: inner,
            height: inner,
            background: `radial-gradient(ellipse at 30% 20%, ${COLORS.bgCardGlow} 0%, ${COLORS.bgCard} 60%, #060A12 100%)`,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(11, 18, 32, 0.25)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: LAYOUT.cardPadding,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                height: visualH - LAYOUT.cardPadding,
                position: 'relative',
              }}
            >
              {visualSlot ?? children}
            </div>
            <div
              style={{
                height: typeH - LAYOUT.cardPadding,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}
            >
              {typeSlot}
            </div>
          </div>
          <Grain />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
