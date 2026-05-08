"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

function Tendrils({ palette }) {
  const group = useRef();
  const linesData = useMemo(() => {
    const N = 12;
    return Array.from({ length: N }, (_, i) => {
      const angle = (i / N) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const length = 3 + Math.random() * 2;
      const phase = Math.random();
      return { angle, length, phase };
    });
  }, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (group.current) group.current.rotation.z = t * 0.04;
    group.current?.children.forEach((line, i) => {
      const d = linesData[i];
      const grow = Math.min(1, (t + d.phase * 2) / 6);
      line.scale.x = grow;
      line.material.opacity = 0.85 * grow;
    });
  });
  return (
    <group ref={group}>
      {linesData.map((d, i) => (
        <mesh key={i} position={[Math.cos(d.angle) * d.length / 2, Math.sin(d.angle) * d.length / 2, 0]} rotation={[0, 0, d.angle]} scale={[0, 1, 1]}>
          <planeGeometry args={[d.length, 0.04]} />
          <meshBasicMaterial color={palette.warmHi} transparent opacity={0.85} />
        </mesh>
      ))}
      <mesh>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color="#1a1408" emissive={palette.warm} emissiveIntensity={2.5} />
      </mesh>
    </group>
  );
}

export default function OutwardReach({ archetypeId = "explorer" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas camera={{ position: [0, 0, 7], fov: 40 }} bg="#04040a" fog={["#0a0c14", 4, 25]}>
      <ambientLight intensity={0.3} />
      <Tendrils palette={palette} />
      <Sparkles count={180} scale={12} size={2} speed={0.3} color={palette.warmHi} opacity={0.5} />
    </SceneCanvas>
  );
}
