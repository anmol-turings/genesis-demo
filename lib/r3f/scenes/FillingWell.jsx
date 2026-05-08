"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

function Well({ palette }) {
  const fluid = useRef();
  const dropRefs = useRef([]);
  const fountainRef = useRef();
  const drops = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      x: (Math.random() - 0.5) * 1.4,
      delay: 0.6 + i * 0.55,
    }));
  }, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const fillT = Math.min(1, t / 10);
    const ease = fillT < 1 ? fillT * fillT * (3 - 2 * fillT) : 1;
    if (fluid.current) {
      const yPos = -1.2 + ease * 2.0;
      fluid.current.position.y = yPos - 1;
      fluid.current.scale.y = ease * 2.0;
      fluid.current.material.emissiveIntensity = 0.6 + ease * 0.8;
    }
    drops.forEach((d, i) => {
      const ref = dropRefs.current[i];
      if (!ref) return;
      const phase = t - d.delay;
      if (phase < 0) {
        ref.position.y = 4;
        ref.material.opacity = 0;
        return;
      }
      const cycleLen = 1.6;
      const c = (phase % cycleLen) / cycleLen;
      ref.position.x = d.x;
      ref.position.y = 3 - c * 4.5;
      ref.material.opacity = c < 0.9 ? 1 : (1 - (c - 0.9) * 10);
    });
    if (fountainRef.current) {
      const fountainT = Math.max(0, (t - 9) / 5);
      const fEase = Math.min(1, fountainT);
      fountainRef.current.scale.set(fEase * 0.9, fEase * 1.5, fEase * 0.9);
      fountainRef.current.material.opacity = fEase * 0.7;
    }
  });
  return (
    <>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 2.0, 32, 1, true]} />
        <meshStandardMaterial color={palette.warmHi} transparent opacity={0.18} side={2} roughness={0.1} metalness={0.6} />
      </mesh>
      <mesh ref={fluid} position={[0, -1, 0]} scale={[0.97, 0, 0.97]}>
        <cylinderGeometry args={[0.97, 0.97, 1, 32]} />
        <meshStandardMaterial color="#1a1408" emissive={palette.warm} emissiveIntensity={0.6} />
      </mesh>
      {drops.map((d, i) => (
        <mesh key={i} ref={(el) => (dropRefs.current[i] = el)}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color={palette.warmHi} transparent opacity={0} />
        </mesh>
      ))}
      <mesh ref={fountainRef} position={[0, 1.5, 0]} scale={[0, 0, 0]}>
        <coneGeometry args={[0.4, 2, 8]} />
        <meshBasicMaterial color={palette.warmHi} transparent opacity={0} />
      </mesh>
    </>
  );
}

export default function FillingWell({ archetypeId = "stoic" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas camera={{ position: [0, 0.5, 5], fov: 40 }} bg="#04040a" fog={["#0a0814", 5, 25]} bloomIntensity={1.1}>
      <ambientLight intensity={0.3} />
      <pointLight color={palette.warmHi} intensity={1.5} position={[0, 1, 2]} />
      <Well palette={palette} />
      <Sparkles count={120} scale={[8, 6, 6]} size={2} speed={0.3} color={palette.warmHi} opacity={0.5} />
    </SceneCanvas>
  );
}
