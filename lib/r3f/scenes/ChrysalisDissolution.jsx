"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

function Chrysalis({ palette }) {
  const casing = useRef();
  const partRefs = useRef([]);
  const newCore = useRef();

  const particles = useMemo(() => {
    return Array.from({ length: 90 }, (_, i) => {
      const t = i / 90;
      const segY = -0.55 + t * 1.1;
      const radius = 0.13 * Math.sin(t * Math.PI);
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * radius;
      return {
        origin: [Math.cos(a) * r, segY, Math.sin(a) * r],
        soupTarget: [
          (Math.random() - 0.5) * 0.55,
          (Math.random() - 0.5) * 1.4,
          (Math.random() - 0.5) * 0.55,
        ],
        orbitR: 0.18 + Math.random() * 0.42,
        orbitTheta: Math.random() * Math.PI * 2,
        orbitPhi: 0.3 + Math.random() * Math.PI * 0.4,
        orbitSpeed: 0.4 + Math.random() * 1.1,
        dissolveDelay: 1.6 + Math.random() * 1.6,
        wobblePhase: Math.random() * Math.PI * 2,
      };
    });
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      const ref = partRefs.current[i];
      if (!ref) return;

      const diss = Math.max(0, Math.min(1, (t - p.dissolveDelay) / 3.5));
      const dEase = diss * diss * (3 - 2 * diss);

      const reform = Math.max(0, Math.min(1, (t - 9.5) / 3.8));
      const rEase = reform * reform * (3 - 2 * reform);

      let x, y, z;

      if (rEase < 0.02) {
        const wob = 0.07 * dEase;
        x = p.origin[0] * (1 - dEase) + p.soupTarget[0] * dEase + Math.sin(t * 1.6 + p.wobblePhase) * wob;
        y = p.origin[1] * (1 - dEase) + p.soupTarget[1] * dEase + Math.cos(t * 1.3 + p.wobblePhase * 1.2) * wob;
        z = p.origin[2] * (1 - dEase) + p.soupTarget[2] * dEase + Math.sin(t * 1.9 + p.wobblePhase * 0.8) * wob;
      } else {
        const ang = p.orbitTheta + t * p.orbitSpeed;
        const ox = Math.cos(ang) * Math.sin(p.orbitPhi) * p.orbitR;
        const oy = Math.cos(p.orbitPhi) * p.orbitR * 0.6;
        const oz = Math.sin(ang) * Math.sin(p.orbitPhi) * p.orbitR;
        x = p.soupTarget[0] * (1 - rEase) + ox * rEase;
        y = p.soupTarget[1] * (1 - rEase) + oy * rEase;
        z = p.soupTarget[2] * (1 - rEase) + oz * rEase;
      }

      ref.position.set(x, y, z);
      ref.material.emissiveIntensity = 0.4 + dEase * 0.7 + rEase * 1.5;
    });

    if (newCore.current) {
      const reform = Math.max(0, Math.min(1, (t - 10) / 4));
      const eased = reform * reform * (3 - 2 * reform);
      newCore.current.scale.setScalar(eased * 0.28);
      newCore.current.material.emissiveIntensity = eased * 3.2;
      newCore.current.rotation.y = t * 0.5;
      newCore.current.rotation.x = t * 0.3;
    }

    if (casing.current) {
      const breath = 0.97 + 0.03 * Math.sin(t * 0.8);
      casing.current.scale.set(0.55 * breath, 1.0 * breath, 0.55 * breath);
      const dissOverall = Math.max(0, Math.min(1, (t - 2) / 6));
      casing.current.material.opacity = 0.18 - dissOverall * 0.04;
    }

    const orbit = t * 0.07;
    state.camera.position.x = Math.sin(orbit) * 1.4;
    state.camera.position.z = 4.2 - Math.min(t, 12) * 0.09;
    state.camera.position.y = 0.15 + Math.sin(t * 0.4) * 0.06;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <mesh ref={casing} scale={[0.55, 1.0, 0.55]}>
        <sphereGeometry args={[1, 32, 24]} />
        <meshPhysicalMaterial
          color={palette.warm}
          transparent
          opacity={0.18}
          roughness={0.25}
          metalness={0.2}
          transmission={0.4}
          thickness={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>

      {particles.map((p, i) => (
        <mesh key={i} ref={(el) => (partRefs.current[i] = el)} position={p.origin}>
          <sphereGeometry args={[0.026, 8, 8]} />
          <meshStandardMaterial
            color="#1a1408"
            emissive={palette.warmHi}
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}

      <mesh ref={newCore}>
        <octahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#1a1408"
          emissive={palette.warmHi}
          emissiveIntensity={0}
          metalness={0.65}
          roughness={0.18}
        />
      </mesh>
    </>
  );
}

export default function ChrysalisDissolution({ archetypeId = "stoic" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas
      camera={{ position: [0, 0.2, 4.2], fov: 42 }}
      bg="#04040a"
      fog={["#0c0a14", 6, 30]}
      bloomIntensity={1.4}
    >
      <ambientLight intensity={0.25} />
      <directionalLight color="#f5e0c8" intensity={1.0} position={[3, 4, 3]} />
      <directionalLight color={palette.warmHi} intensity={0.6} position={[-3, 1, 4]} />
      <Chrysalis palette={palette} />
      <Sparkles
        count={120}
        scale={[5, 5, 4]}
        size={1.5}
        speed={0.25}
        color={palette.warmHi}
        opacity={0.4}
      />
    </SceneCanvas>
  );
}
