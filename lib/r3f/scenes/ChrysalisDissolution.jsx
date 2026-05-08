"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

function noise3(x, y, z) {
  return Math.sin(x * 1.7 + y * 2.3 + z * 1.9) * 0.5
       + Math.sin(x * 3.1 - y * 1.5 + z * 2.7) * 0.3
       + Math.sin(x * 0.9 + y * 4.2 - z * 1.1) * 0.2;
}
function curl(x, y, z) {
  const e = 0.05;
  const dy = noise3(x, y + e, z) - noise3(x, y - e, z);
  const dz = noise3(x, y, z + e) - noise3(x, y, z - e);
  const dx = noise3(x + e, y, z) - noise3(x - e, y, z);
  return [dy - dz, dz - dx, dx - dy];
}

const CHRYSALIS_PROFILE = (() => {
  const pts = [];
  const yTop = 0.95, yBottom = -0.85;
  for (let i = 0; i <= 28; i++) {
    const t = i / 28;
    const y = yTop + t * (yBottom - yTop);
    let r;
    if (t < 0.10)      r = 0.04 + t * 1.8;
    else if (t < 0.35) r = 0.22 + (t - 0.10) * 1.0;
    else if (t < 0.55) r = 0.47 - (t - 0.35) * 0.1;
    else if (t < 0.85) r = 0.45 - (t - 0.55) * 0.7;
    else               r = 0.24 - (t - 0.85) * 1.6;
    pts.push(new THREE.Vector2(Math.max(0.001, r), y));
  }
  return pts;
})();

function wingTarget(side, t) {
  const u = t * Math.PI;
  const base = side * 0.04;
  const tip = side * 0.40;
  const x = base + (tip - base) * Math.sin(u);
  const y = 0.05 + Math.cos(u * 0.7) * 0.20 - Math.sin(u) * 0.06;
  const z = side * Math.sin(u * 0.5) * 0.05;
  return [x, y, z];
}

function Chrysalis({ palette }) {
  const casing = useRef();
  const segmentRefs = useRef([]);
  const chunkRefs = useRef([]);

  const segments = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const t = i / 13;
    return {
      y: -0.55 + t * 1.1,
      r: 0.075 + Math.sin(t * Math.PI) * 0.045,
      dissolveAt: 2.0 + i * 0.18,
    };
  }), []);

  const chunks = useMemo(() => {
    const out = [];
    segments.forEach((seg, segIdx) => {
      for (let j = 0; j < 6; j++) {
        const angle = (j / 6) * Math.PI * 2 + Math.random() * 0.4;
        const r = seg.r * (0.4 + Math.random() * 0.3);
        const wingSide = (segIdx + j) % 2 === 0 ? -1 : 1;
        const wingT = ((segIdx * 6 + j) % 42) / 42;
        out.push({
          startPos: [Math.cos(angle) * r, seg.y + (Math.random() - 0.5) * 0.05, Math.sin(angle) * r],
          dissolveAt: seg.dissolveAt + Math.random() * 0.25,
          flowSeed: Math.random() * 100,
          wingTarget: wingTarget(wingSide, wingT),
          current: null,
          soupEnd: null,
        });
      }
    });
    return out;
  }, [segments]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    const REFORM_START = 12;
    const REFORM_END = 17;

    segments.forEach((s, i) => {
      const ref = segmentRefs.current[i];
      if (!ref) return;
      const fadeT = Math.max(0, Math.min(1, (t - s.dissolveAt) / 0.6));
      ref.material.opacity = 0.85 * (1 - fadeT);
      const breath = 0.97 + 0.03 * Math.sin(t * 1.4 + i * 0.4);
      ref.scale.setScalar(breath);
    });

    chunks.forEach((c, i) => {
      const ref = chunkRefs.current[i];
      if (!ref) return;
      if (!c.current) c.current = [...c.startPos];

      if (t < c.dissolveAt) {
        c.current[0] = c.startPos[0];
        c.current[1] = c.startPos[1];
        c.current[2] = c.startPos[2];
        ref.material.emissiveIntensity = 0.25;
      } else if (t < REFORM_START) {
        const [vx, vy, vz] = curl(
          c.current[0] * 2.4 + c.flowSeed,
          c.current[1] * 2.4 + t * 0.25,
          c.current[2] * 2.4
        );
        const speed = 0.55;
        c.current[0] += vx * delta * speed;
        c.current[1] += vy * delta * speed - delta * 0.04;
        c.current[2] += vz * delta * speed;
        const yNorm = (c.current[1] + 0.85) / 1.8;
        const localR = 0.43 * Math.min(1, Math.sin(yNorm * Math.PI) * 1.3 + 0.1);
        const distXZ = Math.hypot(c.current[0], c.current[2]);
        if (distXZ > localR) {
          const k = localR / distXZ;
          c.current[0] *= k;
          c.current[2] *= k;
        }
        if (c.current[1] > 0.78) c.current[1] = 0.78;
        if (c.current[1] < -0.72) c.current[1] = -0.72;
        ref.material.emissiveIntensity = 0.5 + 0.35 * Math.sin(t * 2.2 + i * 0.3);
      } else {
        if (!c.soupEnd) c.soupEnd = [...c.current];
        const reformU = Math.min(1, (t - REFORM_START) / (REFORM_END - REFORM_START));
        const e = reformU * reformU * (3 - 2 * reformU);
        c.current[0] = c.soupEnd[0] * (1 - e) + c.wingTarget[0] * e;
        c.current[1] = c.soupEnd[1] * (1 - e) + c.wingTarget[1] * e;
        c.current[2] = c.soupEnd[2] * (1 - e) + c.wingTarget[2] * e;
        ref.material.emissiveIntensity = 0.6 + e * 1.6;
      }

      ref.position.set(c.current[0], c.current[1], c.current[2]);
    });

    if (casing.current) {
      const breath = 0.99 + 0.01 * Math.sin(t * 0.55);
      casing.current.scale.set(breath, breath, breath);
      const reformU = Math.max(0, Math.min(1, (t - REFORM_START) / 4));
      casing.current.material.opacity = 0.24 - reformU * 0.10;
    }

    state.camera.position.x = Math.sin(t * 0.13) * 0.10;
    state.camera.position.y = 0.05 + Math.sin(t * 0.4) * 0.04;
    state.camera.position.z = 3.2;
    state.camera.lookAt(0, 0.05, 0);
  });

  return (
    <>
      <mesh position={[0.4, 1.7, -0.3]} rotation={[0.1, 0, -0.4]}>
        <cylinderGeometry args={[0.025, 0.05, 1.4, 8]} />
        <meshStandardMaterial color="#3a2a18" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.45, 4]} />
        <meshBasicMaterial color="#f5e0b0" transparent opacity={0.55} />
      </mesh>
      <mesh ref={casing} position={[0, 0, 0]}>
        <latheGeometry args={[CHRYSALIS_PROFILE, 36]} />
        <meshPhysicalMaterial
          color={palette.warm}
          transparent
          opacity={0.24}
          roughness={0.35}
          metalness={0.15}
          transmission={0.5}
          thickness={0.7}
          ior={1.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {segments.map((s, i) => (
        <mesh key={i} ref={(el) => (segmentRefs.current[i] = el)} position={[0, s.y, 0]}>
          <sphereGeometry args={[s.r, 16, 12]} />
          <meshStandardMaterial
            color="#3a2818"
            transparent
            opacity={0.85}
            roughness={0.65}
            metalness={0.05}
          />
        </mesh>
      ))}
      {chunks.map((c, i) => (
        <mesh key={i} ref={(el) => (chunkRefs.current[i] = el)} position={c.startPos}>
          <sphereGeometry args={[0.022, 6, 6]} />
          <meshStandardMaterial
            color="#1a1408"
            emissive={palette.warmHi}
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}
    </>
  );
}

export default function ChrysalisDissolution({ archetypeId = "stoic" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas
      camera={{ position: [0, 0.05, 3.2], fov: 38 }}
      bg="#04040a"
      fog={["#06060a", 4, 18]}
      bloomIntensity={1.6}
    >
      <ambientLight intensity={0.18} />
      <directionalLight color="#f5e0c8" intensity={1.2} position={[2, 5, 3]} />
      <directionalLight color={palette.warmHi} intensity={0.55} position={[-3, -1, 4]} />
      <pointLight color={palette.warmHi} intensity={0.7} position={[0, 0, 1.2]} distance={3} />
      <Chrysalis palette={palette} />
      <Sparkles count={70} scale={[3, 3.5, 2]} size={1.2} speed={0.15} color={palette.warmHi} opacity={0.32} />
    </SceneCanvas>
  );
}
