"use client";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette, Noise } from "@react-three/postprocessing";

export default function SceneCanvas({
  children,
  camera = { position: [0, 0, 5], fov: 40 },
  bg = "#04040a",
  fog = ["#0a0814", 8, 60],
  bloomIntensity = 1.0,
}) {
  return (
    <Canvas
      style={{ width: "100%", height: "100%", display: "block", background: bg }}
      camera={camera}
      gl={{ antialias: true, toneMapping: 2 }}
      dpr={[1, 2]}
    >
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={fog} />
      {children}
      <EffectComposer>
        <Bloom luminanceThreshold={0.18} luminanceSmoothing={0.85} intensity={bloomIntensity} />
        <Vignette eskil={false} offset={0.32} darkness={0.85} />
        <Noise opacity={0.025} />
      </EffectComposer>
    </Canvas>
  );
}
