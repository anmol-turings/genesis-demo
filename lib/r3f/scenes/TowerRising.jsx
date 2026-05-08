"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

function Tower({ palette }) {
  const group = useRef();
  const cubes = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      target: [0, i * 0.45 - 2.4, 0],
      origin: [(Math.random() - 0.5) * 8, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6],
      delay: i * 0.2,
    }));
  }, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) group.current.rotation.y = t * 0.10;
    group.current?.children.forEach((m, i) => {
      const c = cubes[i];
      if (!c) return;
      const u = Math.max(0, Math.min(1, (t - c.delay) / 4));
      const ease = u * u * (3 - 2 * u);
      m.position.set(
        c.origin[0] + (c.target[0] - c.origin[0]) * ease,
        c.origin[1] + (c.target[1] - c.origin[1]) * ease,
        c.origin[2] + (c.target[2] - c.origin[2]) * ease,
      );
      m.material.emissiveIntensity = 0.4 + ease * 0.9;
    });
  });
  return (
    <group ref={group}>
      {cubes.map((c, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.5, 0.4, 0.5]} />
          <meshStandardMaterial color="#1a1408" emissive={palette.warm} emissiveIntensity={0.4} roughness={0.4} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

export default function TowerRising({ archetypeId = "alchemist" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas camera={{ position: [0, 0, 8], fov: 38 }} bg="#04040a" fog={["#0a0814", 4, 25]}>
      <ambientLight intensity={0.3} />
      <directionalLight color={palette.warmHi} intensity={1.0} position={[3, 5, 3]} />
      <Tower palette={palette} />
      <Sparkles count={120} scale={12} size={2} speed={0.3} color={palette.warmHi} opacity={0.5} />
    </SceneCanvas>
  );
}
