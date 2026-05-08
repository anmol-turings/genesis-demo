"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Sparkles,
  Environment,
  ContactShadows,
  MeshReflectorMaterial,
} from "@react-three/drei";
import * as THREE from "three";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

const SLAB_DEFS = [
  { pos: [ 0.62, -1.10,  0.18], size: [0.55, 0.32, 0.20], rot: [ 0.10,  0.45,  0.05], dropAt: 3.0 },
  { pos: [-0.55, -0.40, -0.22], size: [0.50, 0.28, 0.18], rot: [-0.08, -0.55,  0.00], dropAt: 4.3 },
  { pos: [ 0.52,  0.20, -0.32], size: [0.40, 0.24, 0.16], rot: [ 0.05,  0.65, -0.12], dropAt: 5.5 },
  { pos: [-0.46,  0.75,  0.22], size: [0.38, 0.22, 0.14], rot: [-0.10, -0.40,  0.06], dropAt: 6.7 },
  { pos: [ 0.40,  1.25,  0.12], size: [0.32, 0.20, 0.13], rot: [ 0.05,  0.50,  0.00], dropAt: 7.9 },
  { pos: [-0.34,  1.70, -0.16], size: [0.28, 0.18, 0.12], rot: [-0.05, -0.60,  0.05], dropAt: 9.1 },
];

function Slab({ def, idx, palette }) {
  const ref = useRef();
  const dustRefs = useRef([]);
  const dustCount = 8;
  const dustSeeds = useMemo(
    () =>
      Array.from({ length: dustCount }, () => ({
        a: Math.random() * Math.PI * 2,
        s: 0.4 + Math.random() * 0.6,
        d: Math.random() * 0.5,
      })),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!ref.current) return;

    if (t < def.dropAt) {
      const tense = 0.99 + 0.01 * Math.sin(t * 1.4 + idx * 0.7);
      ref.current.position.set(def.pos[0], def.pos[1], def.pos[2]);
      ref.current.rotation.set(def.rot[0], def.rot[1], def.rot[2]);
      ref.current.scale.setScalar(tense);
      ref.current.material.opacity = 0.88;
      dustRefs.current.forEach((d) => { if (d) d.material.opacity = 0; });
    } else {
      const dropT = t - def.dropAt;
      const lateralX = (idx % 2 === 0 ? 1 : -1) * 0.35;
      const lateralZ = (idx % 3 === 0 ? 0.20 : -0.20);
      ref.current.position.x = def.pos[0] + lateralX * Math.min(1, dropT * 0.6);
      ref.current.position.y = def.pos[1] - 0.5 * 9.4 * dropT * dropT;
      ref.current.position.z = def.pos[2] + lateralZ * Math.min(1, dropT * 0.6);
      ref.current.rotation.x = def.rot[0] + dropT * 1.6;
      ref.current.rotation.y = def.rot[1] + dropT * 1.3;
      ref.current.rotation.z = def.rot[2] + dropT * 0.9;
      ref.current.material.opacity = Math.max(0, 0.88 - dropT * 0.55);

      dustRefs.current.forEach((d, i) => {
        if (!d) return;
        const seed = dustSeeds[i];
        const burstT = Math.max(0, dropT - seed.d);
        if (burstT <= 0 || burstT > 1.5) {
          d.material.opacity = 0;
          return;
        }
        const rad = burstT * seed.s;
        d.position.set(
          def.pos[0] + Math.cos(seed.a) * rad,
          def.pos[1] + Math.sin(seed.a) * rad * 0.4 - burstT * 0.3,
          def.pos[2] + Math.sin(seed.a) * rad
        );
        d.material.opacity = Math.max(0, 0.55 * (1 - burstT / 1.5));
      });
    }
  });

  return (
    <>
      <mesh ref={ref}>
        <boxGeometry args={def.size} />
        <meshStandardMaterial
          color="#1a1814"
          roughness={0.88}
          metalness={0.18}
          transparent
          opacity={0.88}
        />
      </mesh>
      {dustSeeds.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (dustRefs.current[i] = el)}
          position={def.pos}
        >
          <sphereGeometry args={[0.022, 6, 6]} />
          <meshStandardMaterial
            color="#1a1408"
            emissive={palette.warmHi}
            emissiveIntensity={1.6}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </>
  );
}

function CentralColumn({ palette }) {
  const core = useRef();
  const inner = useRef();
  const shell = useRef();
  const crown = useRef();
  const base = useRef();
  const bands = useRef([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const shed = SLAB_DEFS.filter((s) => t > s.dropAt).length / SLAB_DEFS.length;

    if (core.current) {
      const breath = 0.95 + 0.05 * Math.sin(t * 0.95);
      core.current.scale.setScalar(breath * 0.20);
      core.current.material.emissiveIntensity = 1.5 + shed * 2.4 + Math.sin(t * 1.4) * 0.25;
    }
    if (inner.current) {
      inner.current.material.emissiveIntensity = 0.25 + shed * 1.4;
      inner.current.rotation.y = t * 0.04 + shed * 0.6;
    }
    if (shell.current) {
      shell.current.rotation.y = -t * 0.03;
      shell.current.material.opacity = 0.16 + shed * 0.20;
    }
    if (crown.current) {
      crown.current.rotation.y = -t * 0.08;
      crown.current.material.emissiveIntensity = 0.4 + shed * 1.8;
    }
    if (base.current) {
      base.current.material.emissiveIntensity = 0.25 + shed * 1.4;
    }
    bands.current.forEach((b, i) => {
      if (!b) return;
      b.rotation.y = t * (i % 2 === 0 ? 0.06 : -0.06);
      b.material.emissiveIntensity = 0.30 + shed * 1.1;
    });

    state.camera.position.x = Math.sin(t * 0.12) * 0.18;
    state.camera.position.y = 0.42 + Math.sin(t * 0.4) * 0.06;
    state.camera.position.z = 5.5 - Math.min(t, 14) * 0.07;
    state.camera.lookAt(0, 0.18, 0);
  });

  return (
    <group>
      <mesh ref={core} position={[0, 0.20, 0]}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color="#3a2a14"
          emissive={palette.warmHi}
          emissiveIntensity={1.5}
          metalness={0.65}
          roughness={0.18}
        />
      </mesh>
      <mesh ref={inner} position={[0, 0.20, 0]}>
        <cylinderGeometry args={[0.22, 0.32, 3.0, 24, 1]} />
        <meshStandardMaterial
          color="#1a140a"
          emissive={palette.warm}
          emissiveIntensity={0.25}
          roughness={0.42}
          metalness={0.45}
        />
      </mesh>
      <mesh ref={shell} position={[0, 0.20, 0]}>
        <cylinderGeometry args={[0.34, 0.44, 3.1, 28, 1]} />
        <meshPhysicalMaterial
          color={palette.warm}
          transparent
          opacity={0.16}
          roughness={0.22}
          metalness={0.10}
          transmission={0.6}
          thickness={0.4}
          ior={1.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {[1.0, 0.0, -1.0].map((y, i) => (
        <mesh
          key={i}
          ref={(el) => (bands.current[i] = el)}
          position={[0, y + 0.20, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.30, 0.014, 10, 36]} />
          <meshStandardMaterial
            color="#1a1408"
            emissive={palette.warmHi}
            emissiveIntensity={0.3}
            metalness={0.55}
            roughness={0.2}
          />
        </mesh>
      ))}
      <mesh ref={crown} position={[0, 1.84, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.026, 10, 32]} />
        <meshStandardMaterial
          color="#1a1408"
          emissive={palette.warmHi}
          emissiveIntensity={0.4}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      <mesh ref={base} position={[0, -1.32, 0]}>
        <cylinderGeometry args={[0.46, 0.50, 0.08, 28]} />
        <meshStandardMaterial
          color="#1a1408"
          emissive={palette.warm}
          emissiveIntensity={0.25}
          metalness={0.6}
          roughness={0.32}
        />
      </mesh>
    </group>
  );
}

function ReflectiveGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.36, 0]}>
      <circleGeometry args={[6, 64]} />
      <MeshReflectorMaterial
        blur={[420, 110]}
        resolution={1024}
        mixBlur={1.0}
        mixStrength={0.55}
        roughness={0.85}
        depthScale={1.0}
        minDepthThreshold={0.5}
        maxDepthThreshold={1.4}
        color="#0a0810"
        metalness={0.45}
        mirror={0.4}
      />
    </mesh>
  );
}

export default function SlabShedding({ archetypeId = "stoic" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas
      camera={{ position: [0, 0.42, 5.5], fov: 38 }}
      bg="#04040a"
      fog={["#0a0814", 5, 22]}
      bloomIntensity={1.6}
    >
      <ambientLight intensity={0.12} />
      <Environment preset="night" />
      <directionalLight color="#f5e0c8" intensity={1.5} position={[3, 5, 4]} castShadow />
      <directionalLight color={palette.warmHi} intensity={0.75} position={[-4, 2, -2]} />
      <pointLight color={palette.warmHi} intensity={1.4} position={[0, 0.5, 0]} distance={3.2} />

      <CentralColumn palette={palette} />
      {SLAB_DEFS.map((def, idx) => (
        <Slab key={idx} def={def} idx={idx} palette={palette} />
      ))}

      <ReflectiveGround />
      <ContactShadows
        position={[0, -1.34, 0]}
        opacity={0.55}
        scale={5}
        blur={2.4}
        far={3}
      />

      <Sparkles count={120} scale={[5, 5, 4]} size={1.8} speed={0.2} color={palette.warmHi} opacity={0.55} />
      <Sparkles count={80} scale={[14, 10, 8]} size={0.7} speed={0.08} color="#5a4520" opacity={0.30} />
    </SceneCanvas>
  );
}
