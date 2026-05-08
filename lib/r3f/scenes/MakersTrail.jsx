"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Trail, Sparkles } from "@react-three/drei";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

function Maker({ palette }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.6;
    if (ref.current) {
      ref.current.position.x = Math.sin(t) * 2.5 * Math.cos(t * 0.4);
      ref.current.position.y = Math.cos(t * 1.3) * 1.6;
      ref.current.position.z = Math.sin(t * 0.7) * 1.2;
    }
  });
  return (
    <Trail width={2.5} length={8} color={palette.warmHi} attenuation={(t) => t * t}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#1a1408" emissive={palette.warm} emissiveIntensity={3.0} />
      </mesh>
    </Trail>
  );
}

export default function MakersTrail({ archetypeId = "craftsman" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas camera={{ position: [0, 0, 7], fov: 42 }} bg="#04040a" fog={["#0c0a14", 6, 30]} bloomIntensity={1.4}>
      <ambientLight intensity={0.2} />
      <Maker palette={palette} />
      <Sparkles count={180} scale={12} size={2} speed={0.3} color={palette.warmHi} opacity={0.5} />
    </SceneCanvas>
  );
}
