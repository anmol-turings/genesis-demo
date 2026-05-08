"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

function Knot({ palette }) {
  const ringA = useRef();
  const ringB = useRef();
  const door = useRef();
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const release = Math.max(0, Math.min(1, (t - 4) / 6));
    const ease = release * release * (3 - 2 * release);
    if (ringA.current) {
      ringA.current.position.x = -ease * 1.4;
      ringA.current.rotation.z = Math.sin(t * 0.4) * 0.05 + ease * 0.15;
      ringA.current.rotation.y = Math.PI / 2 - ease * 0.2;
    }
    if (ringB.current) {
      ringB.current.position.x = ease * 1.4;
      ringB.current.rotation.z = -Math.sin(t * 0.45) * 0.05 - ease * 0.15;
      ringB.current.rotation.y = Math.PI / 2 + ease * 0.2;
    }
    if (door.current) {
      const open = Math.max(0, (t - 9) / 5);
      const oEase = Math.min(1, open);
      door.current.scale.set(oEase * 1.4, oEase * 2.2, 1);
      door.current.material.opacity = oEase * 0.85;
    }
  });
  return (
    <>
      <mesh ref={ringA} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[1.0, 0.10, 16, 64]} />
        <meshStandardMaterial color="#1a1408" emissive={palette.warm} emissiveIntensity={2.0} roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh ref={ringB} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[1.0, 0.10, 16, 64]} />
        <meshStandardMaterial color="#1a0808" emissive={palette.shadow} emissiveIntensity={1.6} roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh ref={door} position={[0, 0, -0.5]} scale={[0, 0, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={palette.warmHi} transparent opacity={0} />
      </mesh>
    </>
  );
}

export default function KnotUntying({ archetypeId = "stoic" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas camera={{ position: [0, 0.3, 5.5], fov: 42 }} bg="#04040a" fog={["#0c0814", 5, 25]} bloomIntensity={1.4}>
      <ambientLight intensity={0.25} />
      <Knot palette={palette} />
    </SceneCanvas>
  );
}
