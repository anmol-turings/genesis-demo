"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

function Pair({ palette }) {
  const left = useRef();
  const right = useRef();
  const door = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const approach = Math.min(1, t / 7);
    const ease = approach * approach * (3 - 2 * approach);
    if (left.current) left.current.position.x = -3 + ease * 2.0;
    if (right.current) right.current.position.x = 3 - ease * 2.0;
    if (door.current) {
      const open = Math.max(0, (t - 5) / 5);
      const eased = Math.min(1, open);
      door.current.scale.y = eased * 3;
      door.current.scale.x = eased * 1.5;
      door.current.material.opacity = eased * 0.85;
    }
  });
  return (
    <group>
      <mesh ref={left} position={[-3, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#1a1408" emissive={palette.warm} emissiveIntensity={2.0} />
      </mesh>
      <mesh ref={right} position={[3, 0, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#1a0808" emissive={palette.shadow} emissiveIntensity={1.4} />
      </mesh>
      <mesh ref={door} position={[0, 0, -3]} scale={[0, 0, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={palette.warmHi} transparent opacity={0} />
      </mesh>
    </group>
  );
}

export default function DoorwayOpening({ archetypeId = "stoic" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas camera={{ position: [0, 0.5, 7], fov: 42 }} bg="#04040a" fog={["#0c0814", 5, 28]} bloomIntensity={1.3}>
      <ambientLight intensity={0.25} />
      <Pair palette={palette} />
      <Sparkles count={150} scale={14} size={2} speed={0.25} color={palette.warmHi} opacity={0.45} />
    </SceneCanvas>
  );
}
