"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

function Field({ palette }) {
  const pointRefs = useRef([]);
  const lineRefs = useRef([]);
  const points = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 4; j++) {
        arr.push({
          pos: [(i - 2.5) * 1.0 + (Math.random() - 0.5) * 0.3, (j - 1.5) * 0.9 + (Math.random() - 0.5) * 0.3, (Math.random() - 0.5) * 0.6],
        });
      }
    }
    arr.forEach((p) => { p.dist = Math.hypot(p.pos[0], p.pos[1]); });
    arr.sort((a, b) => a.dist - b.dist);
    arr.forEach((p, i) => { p.delay = 1.5 + i * 0.35; });
    return arr;
  }, []);
  const edges = useMemo(() => points.slice(1).map((p, i) => ({ from: points[i].pos, to: p.pos, delay: p.delay - 0.3 })), [points]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    points.forEach((p, i) => {
      const ref = pointRefs.current[i];
      if (!ref) return;
      const u = Math.max(0, Math.min(1, (t - p.delay) / 0.6));
      ref.material.emissiveIntensity = 0.05 + u * 1.6;
      const s = 0.12 + u * 0.18;
      ref.scale.setScalar(s);
    });
    edges.forEach((e, i) => {
      const ref = lineRefs.current[i];
      if (!ref) return;
      const u = Math.max(0, Math.min(1, (t - e.delay) / 0.45));
      ref.material.opacity = u * 0.65;
      ref.scale.x = u;
    });
  });
  return (
    <>
      {points.map((p, i) => (
        <mesh key={i} ref={(el) => (pointRefs.current[i] = el)} position={p.pos} scale={0.12}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial color="#1a1408" emissive={palette.warm} emissiveIntensity={0.05} />
        </mesh>
      ))}
      {edges.map((e, i) => {
        const dx = e.to[0] - e.from[0];
        const dy = e.to[1] - e.from[1];
        const dz = e.to[2] - e.from[2];
        const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const mid = [(e.from[0] + e.to[0]) / 2, (e.from[1] + e.to[1]) / 2, (e.from[2] + e.to[2]) / 2];
        const angle = Math.atan2(dy, dx);
        return (
          <mesh
            key={i}
            ref={(el) => (lineRefs.current[i] = el)}
            position={mid}
            rotation={[0, 0, angle]}
            scale={[0, 1, 1]}
          >
            <planeGeometry args={[length, 0.025]} />
            <meshBasicMaterial color={palette.warmHi} transparent opacity={0} />
          </mesh>
        );
      })}
    </>
  );
}

export default function Cascade({ archetypeId = "explorer" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas camera={{ position: [0, 0, 7], fov: 44 }} bg="#04040a" fog={["#0a0c14", 5, 20]} bloomIntensity={1.2}>
      <ambientLight intensity={0.3} />
      <Field palette={palette} />
    </SceneCanvas>
  );
}
