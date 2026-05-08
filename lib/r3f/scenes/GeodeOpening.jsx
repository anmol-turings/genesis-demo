"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

function Geode({ palette }) {
  const leftHalf = useRef();
  const rightHalf = useRef();
  const crystalRefs = useRef([]);

  const crystals = useMemo(() => {
    return Array.from({ length: 22 }, (_, i) => ({
      pos: [
        (Math.random() - 0.5) * 0.85,
        (Math.random() - 0.5) * 0.85,
        (Math.random() - 0.5) * 0.55,
      ],
      rot: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI],
      scale: 0.07 + Math.random() * 0.13,
      breathOffset: i * 0.4,
    }));
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const open = Math.max(0, Math.min(1, (t - 3) / 5));
    const ease = open * open * (3 - 2 * open);

    if (leftHalf.current) {
      leftHalf.current.rotation.z = ease * Math.PI * 0.42;
      leftHalf.current.position.x = -ease * 0.55;
      leftHalf.current.position.y = ease * 0.05;
    }
    if (rightHalf.current) {
      rightHalf.current.rotation.z = -ease * Math.PI * 0.42;
      rightHalf.current.position.x = ease * 0.55;
      rightHalf.current.position.y = ease * 0.05;
    }

    crystals.forEach((c, i) => {
      const ref = crystalRefs.current[i];
      if (!ref) return;
      ref.material.emissiveIntensity = 0.2 + ease * 2.8;
      ref.rotation.y = c.rot[1] + t * 0.18;
      ref.rotation.x = c.rot[0] + t * 0.12;
      const breath = 0.95 + 0.06 * Math.sin(t * 1.4 + c.breathOffset);
      ref.scale.setScalar(c.scale * breath);
    });

    const dolly = Math.min(1, t / 14);
    state.camera.position.z = 4.6 - dolly * 1.4;
    state.camera.position.y = 0.25 + dolly * 0.35;
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <mesh ref={leftHalf}>
        <sphereGeometry args={[1.05, 14, 10, 0, Math.PI]} />
        <meshStandardMaterial color="#2a2620" roughness={0.95} metalness={0.05} flatShading />
      </mesh>
      <mesh ref={rightHalf} rotation={[0, Math.PI, 0]}>
        <sphereGeometry args={[1.05, 14, 10, 0, Math.PI]} />
        <meshStandardMaterial color="#2a2620" roughness={0.95} metalness={0.05} flatShading />
      </mesh>
      {crystals.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => (crystalRefs.current[i] = el)}
          position={c.pos}
          rotation={c.rot}
          scale={c.scale}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#1a1408"
            emissive={palette.warmHi}
            emissiveIntensity={0.2}
            roughness={0.15}
            metalness={0.65}
          />
        </mesh>
      ))}
    </>
  );
}

export default function GeodeOpening({ archetypeId = "stoic" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas
      camera={{ position: [0, 0.25, 4.6], fov: 42 }}
      bg="#04040a"
      fog={["#0c0a14", 6, 30]}
      bloomIntensity={1.5}
    >
      <ambientLight intensity={0.25} />
      <directionalLight color="#f5e0c8" intensity={1.1} position={[2, 3, 2]} />
      <directionalLight color={palette.warmHi} intensity={0.7} position={[-3, 1, 4]} />
      <Geode palette={palette} />
      <Sparkles
        count={140}
        scale={[6, 5, 4]}
        size={2}
        speed={0.25}
        color={palette.warmHi}
        opacity={0.5}
      />
    </SceneCanvas>
  );
}
