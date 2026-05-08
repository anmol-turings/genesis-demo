"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

function Pulse({ palette }) {
  const core = useRef();
  const rings = useRef([]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const breath = 0.5 + 0.5 * Math.sin(t * 0.9);
    if (core.current) {
      const s = 0.7 + breath * 0.18;
      core.current.scale.set(s, s, s);
      core.current.material.emissiveIntensity = 1.4 + breath * 1.2;
    }
    rings.current.forEach((r, i) => {
      if (!r) return;
      const phase = (t * 0.4 + i * 0.33) % 1;
      const scale = 1 + phase * 4;
      r.scale.set(scale, scale, scale);
      r.material.opacity = (1 - phase) * 0.6;
    });
  });
  return (
    <>
      <mesh ref={core}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial color="#1a1408" emissive={palette.warm} emissiveIntensity={2.0} roughness={0.3} metalness={0.2} />
      </mesh>
      {[0,1,2].map(i => (
        <mesh key={i} ref={el => rings.current[i] = el} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.0, 1.04, 64]} />
          <meshBasicMaterial color={palette.warmHi} transparent opacity={0.5} />
        </mesh>
      ))}
    </>
  );
}

export default function BuildingPulse({ archetypeId = "stoic" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas camera={{ position: [0, 0.5, 6], fov: 38 }} bg="#04040a" fog={["#0c0814", 4, 30]}>
      <ambientLight intensity={0.3} />
      <pointLight color={palette.warmHi} intensity={2.0} distance={10} decay={2} />
      <Pulse palette={palette} />
      <Sparkles count={150} scale={[10, 6, 10]} size={2} speed={0.4} color={palette.warmHi} opacity={0.55} />
    </SceneCanvas>
  );
}
