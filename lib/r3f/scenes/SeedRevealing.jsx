"use client";
import { useRef, useMemo, useEffect, forwardRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

const Branch = forwardRef(function Branch({ dir, length, color }, ref) {
  const groupRef = useRef();
  useEffect(() => {
    if (groupRef.current) {
      const t = new THREE.Vector3(dir[0]*10, dir[1]*10, dir[2]*10);
      groupRef.current.lookAt(t);
      groupRef.current.rotateX(Math.PI / 2);
    }
  }, [dir]);
  return (
    <group ref={groupRef}>
      <mesh ref={ref} position={[0, length/2, 0]} scale={[1, 0, 1]}>
        <cylinderGeometry args={[0.025, 0.04, length, 6]} />
        <meshBasicMaterial color={color} transparent opacity={0} />
      </mesh>
    </group>
  );
});

function Seed({ palette }) {
  const seed = useRef();
  const beamRefs = useRef([]);
  const beams = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const theta = (i / 14) * Math.PI * 2;
      const tilt = 0.6 + (i % 4) * 0.18;
      return {
        dir: [Math.sin(theta) * Math.sin(tilt), Math.cos(tilt), Math.cos(theta) * Math.sin(tilt) * 0.55],
        delay: 2.0 + i * 0.18,
        length: 2.0 + Math.random() * 1.4,
      };
    });
  }, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (seed.current) {
      const pulse = 0.94 + 0.06 * Math.sin(t * 1.6);
      seed.current.scale.setScalar(pulse * 0.42);
      seed.current.material.emissiveIntensity = 1.7 + 0.4 * Math.sin(t * 2.2);
    }
    beams.forEach((b, i) => {
      const ref = beamRefs.current[i];
      if (!ref) return;
      const u = Math.max(0, Math.min(1, (t - b.delay) / 2.2));
      const ease = u * u * (3 - 2 * u);
      ref.scale.y = ease * b.length;
      ref.material.opacity = ease * 0.85;
    });
    const dolly = Math.min(1, t / 14);
    state.camera.position.z = 4 + dolly * 4;
    state.camera.position.y = 0.2 + dolly * 0.6;
    state.camera.lookAt(0, 0.6, 0);
  });
  return (
    <>
      <mesh ref={seed}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#1a0a04" emissive={palette.warm} emissiveIntensity={1.8} roughness={0.3} metalness={0.2} />
      </mesh>
      {beams.map((b, i) => (
        <Branch key={i} dir={b.dir} length={b.length} color={palette.warmHi} ref={(el) => (beamRefs.current[i] = el)} />
      ))}
    </>
  );
}

export default function SeedRevealing({ archetypeId = "stoic" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas camera={{ position: [0, 0.2, 4], fov: 42 }} bg="#04040a" fog={["#0c0a14", 6, 30]} bloomIntensity={1.2}>
      <ambientLight intensity={0.3} />
      <Seed palette={palette} />
      <Sparkles count={180} scale={[8, 8, 8]} size={2} speed={0.3} color={palette.warmHi} opacity={0.55} />
    </SceneCanvas>
  );
}
