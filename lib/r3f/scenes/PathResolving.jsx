"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

function Path({ palette }) {
  const path = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const reveal = Math.min(1, t / 8);
    if (path.current) path.current.material.opacity = 0.85 * reveal;
  });
  return (
    <group>
      <mesh ref={path} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, -5]}>
        <planeGeometry args={[0.3, 30]} />
        <meshBasicMaterial color={palette.warmHi} transparent opacity={0} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, -5]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0a0808" roughness={1} />
      </mesh>
    </group>
  );
}

export default function PathResolving({ archetypeId = "healer" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas camera={{ position: [0, 1.5, 6], fov: 50 }} bg="#040608" fog={["#1a1c20", 2, 18]} bloomIntensity={1.2}>
      <ambientLight intensity={0.2} />
      <pointLight color={palette.warmHi} intensity={1.5} position={[0, 2, -5]} distance={20} />
      <Path palette={palette} />
      <Sparkles count={200} scale={[20, 8, 25]} position={[0, 1, -5]} size={2.5} speed={0.2} color={palette.warmHi} opacity={0.45} />
    </SceneCanvas>
  );
}
