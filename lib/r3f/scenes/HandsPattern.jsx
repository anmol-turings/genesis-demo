"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Trail } from "@react-three/drei";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

function Maker({ palette }) {
  const ref = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.7;
    if (!ref.current) return;
    const elaboration = Math.min(1, state.clock.elapsedTime / 8);
    const a = 1.0 + elaboration * 0.6;
    const b = 0.6 + elaboration * 1.2;
    const c = 0.4 + elaboration * 1.6;
    ref.current.position.x = Math.sin(t * a) * 2.5 * Math.cos(t * 0.4);
    ref.current.position.y = Math.cos(t * b) * 1.6 + Math.sin(t * c * 1.3) * 0.4 * elaboration;
    ref.current.position.z = Math.sin(t * 0.7 + elaboration * 2) * 1.2;
  });
  return (
    <Trail width={2.4} length={9} color={palette.warmHi} attenuation={(x) => x * x}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#1a1408" emissive={palette.warm} emissiveIntensity={3.0} />
      </mesh>
    </Trail>
  );
}

export default function HandsPattern({ archetypeId = "craftsman" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas camera={{ position: [0, 0, 7], fov: 42 }} bg="#04040a" fog={["#0c0a14", 6, 30]} bloomIntensity={1.5}>
      <ambientLight intensity={0.2} />
      <Maker palette={palette} />
    </SceneCanvas>
  );
}
