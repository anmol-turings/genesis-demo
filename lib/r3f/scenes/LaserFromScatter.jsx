"use client";
import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

function Convergence({ palette }) {
  const rayRefs = useRef([]);
  const barrierRef = useRef();
  const rays = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.6;
      return {
        startEuler: [phi * (Math.random() - 0.5) * 2, theta, phi * (Math.random() - 0.5) * 2],
        targetEuler: [0, 0, 0],
      };
    });
  }, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const align = Math.max(0, Math.min(1, (t - 2) / 6));
    const ease = align * align * (3 - 2 * align);
    rays.forEach((r, i) => {
      const ref = rayRefs.current[i];
      if (!ref) return;
      ref.rotation.x = r.startEuler[0] * (1 - ease) + r.targetEuler[0] * ease;
      ref.rotation.y = r.startEuler[1] * (1 - ease) + r.targetEuler[1] * ease;
      ref.rotation.z = r.startEuler[2] * (1 - ease) + r.targetEuler[2] * ease;
      ref.material.opacity = 0.3 + ease * 0.5;
    });
    if (barrierRef.current) {
      const pierceT = Math.max(0, (t - 9) / 4);
      const eased = Math.min(1, pierceT);
      barrierRef.current.material.opacity = 0.6 - eased * 0.5;
      barrierRef.current.scale.x = 1 - eased * 0.6;
    }
  });
  return (
    <>
      <mesh ref={barrierRef} position={[3, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial color={palette.warmHi} transparent opacity={0.6} />
      </mesh>
      {rays.map((r, i) => (
        <mesh key={i} ref={(el) => (rayRefs.current[i] = el)} position={[1.5, 0, 0]}>
          <boxGeometry args={[3, 0.025, 0.025]} />
          <meshBasicMaterial color={palette.warmHi} transparent opacity={0.3} />
        </mesh>
      ))}
    </>
  );
}

export default function LaserFromScatter({ archetypeId = "alchemist" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas camera={{ position: [-1, 1.2, 4.5], fov: 44 }} bg="#04040a" fog={["#0a0814", 4, 20]} bloomIntensity={1.4}>
      <ambientLight intensity={0.25} />
      <Convergence palette={palette} />
    </SceneCanvas>
  );
}
