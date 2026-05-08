"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

function Form({ palette }) {
  const core = useRef();
  const shell = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (core.current) { core.current.rotation.x = t * 0.10; core.current.rotation.y = t * 0.16; }
    if (shell.current) { shell.current.rotation.x = -t * 0.07; shell.current.rotation.y = -t * 0.05; }
    const dolly = Math.min(t / 14, 1);
    const eased = dolly * dolly * (3 - 2 * dolly);
    state.camera.position.z = 0 - eased * 38;
    state.camera.position.y = 0.3 + Math.sin(t * 0.3) * 0.12;
    state.camera.position.x = Math.sin(t * 0.18) * 0.7;
    state.camera.lookAt(0, 0.4 + Math.sin(t * 0.22) * 0.08, -65);
    if (core.current) core.current.material.emissiveIntensity = 1.2 + eased * 1.6;
  });
  return (
    <group position={[0, 0.4, -65]}>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color="#3a2a14" roughness={0.4} metalness={0.3} emissive={palette.warm} emissiveIntensity={1.6} />
      </mesh>
      <mesh ref={shell}>
        <icosahedronGeometry args={[1.4, 0]} />
        <meshBasicMaterial color={palette.warmHi} wireframe transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

export default function ApproachingForm({ archetypeId = "stoic" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas camera={{ position: [0, 0.3, 0], fov: 40 }} bg="#04040a" fog={["#0c0a14", 5, 80]} bloomIntensity={1.1}>
      <ambientLight color="#0e0a14" intensity={0.5} />
      <directionalLight color="#3a2a18" intensity={0.4} position={[2, 1, 1]} />
      <Form palette={palette} />
      <Sparkles count={220} scale={[24, 10, 60]} position={[0, 0, -30]} size={3} speed={0.3} color={palette.warmHi} opacity={0.6} />
    </SceneCanvas>
  );
}
