import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PALETTE} from './palette';
import {Vignette, AtmosphericParticles, SceneFade, KenBurns} from './atmosphere';

// ═══════════════════════════════════════════════════════════════════════
// SCENE SHELL — the "always-on" cinematic chrome for every scene.
//
// What it provides automatically:
//   - Background fill (defaults to deep void)
//   - Subtle ken-burns drift (the camera is never fully static)
//   - Atmospheric particles (the air is never fully empty)
//   - Vignette (eye is framed)
//   - Loop-friendly fade in/out (no hard cuts)
//
// What you provide as children:
//   - The actual subject of the scene (the iceberg, the embers, etc.)
//
// You can opt out of any layer with the corresponding prop set to false.
// ═══════════════════════════════════════════════════════════════════════

export const SceneShell: React.FC<{
  background?: string;
  particleColor?: string;
  particleCount?: number;
  particleZone?: {top: number; bottom: number};
  particleOpacity?: number;
  vignetteStrength?: number;
  panY?: number;
  zoomTo?: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
  showParticles?: boolean;
  showVignette?: boolean;
  showKenBurns?: boolean;
  children: React.ReactNode;
}> = ({
  background = PALETTE.deep,
  particleColor = PALETTE.goldLight,
  particleCount = 24,
  particleZone = {top: 0, bottom: 1},
  particleOpacity = 0.35,
  vignetteStrength = 0.5,
  panY = -8,
  zoomTo = 1.04,
  fadeInFrames = 14,
  fadeOutFrames = 20,
  showParticles = true,
  showVignette = true,
  showKenBurns = true,
  children,
}) => {
  const innerContent = (
    <>
      {/* Subject layer — your scene's unique content */}
      <AbsoluteFill>{children}</AbsoluteFill>

      {/* Atmospheric particles — drift over the subject */}
      {showParticles && (
        <AtmosphericParticles
          count={particleCount}
          color={particleColor}
          opacity={particleOpacity}
          zone={particleZone}
        />
      )}
    </>
  );

  return (
    <SceneFade fadeInFrames={fadeInFrames} fadeOutFrames={fadeOutFrames}>
      <AbsoluteFill style={{background}}>
        {showKenBurns
          ? <KenBurns panY={panY} zoomTo={zoomTo}>{innerContent}</KenBurns>
          : innerContent}
        {showVignette && <Vignette strength={vignetteStrength} />}
      </AbsoluteFill>
    </SceneFade>
  );
};
