"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import SceneCanvas from "../SceneCanvas";
import { colorFor } from "../palette";

function Resolution({ palette }) {
  const noiseRefs = useRef([]);
  const arrowRef = useRef();
  const noiseCount = 48;
  const noisePoints = useMemo(() => {
    return Array.from({ length: noiseCount }, () => ({
      origin: [(Math.random() - 0.5) * 6, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 3],
      target: [(Math.random() - 0.5) * 1.2, (Math.random() - 0.5) * 0.5, 0],
      phase: Math.random() * Math.PI * 2,
    }));
  }, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const convergeT = Math.max(0, Math.min(1, (t - 4) / 4));
    const ease = convergeT * convergeT * (3 - 2 * convergeT);
    noisePoints.forEach((p, i) => {
      const ref = noiseRefs.current[i];
      if (!ref) return;
      const lineProg = i / noiseCount;
      let tx, ty;
      if (lineProg < 0.7) {
        tx = -1.5 + lineProg * 4.0;
        ty = 0;
      } else {
        const headT = (lineProg - 0.7) / 0.3;
        const side = i % 2 === 0 ? 1 : -1;
        tx = 1.3 + headT * (-0.6);
        ty = side * headT * 0.45;
      }
      const driftX = Math.sin(t * 1.8 + p.phase) * 0.3;
      const driftY = Math.cos(t * 1.5 + p.phase * 1.3) * 0.2;
      ref.position.x = p.origin[0] * (1 - ease) + tx * ease + driftX * (1 - ease);
      ref.position.y = p.origin[1] * (1 - ease) + ty * ease + driftY * (1 - ease);
      ref.position.z = p.origin[2] * (1 - ease);
      ref.material.emissiveIntensity = 0.4 + ease * 1.4;
    });
  });
  return (
    <>
      {noisePoints.map((p, i) => (
        <mesh key={i} ref={(el) => (noiseRefs.current[i] = el)} position={p.origin}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color="#1a1408" emissive={palette.warm} emissiveIntensity={0.4} />
        </mesh>
      ))}
    </>
  );
}

export default function SignalFromNoise({ archetypeId = "healer" }) {
  const palette = colorFor(archetypeId);
  return (
    <SceneCanvas camera={{ position: [0, 0, 5.5], fov: 42 }} bg="#04040a" fog={["#0a0e10", 4, 22]} bloomIntensity={1.3}>
      <ambientLight intensity={0.3} />
      <Resolution palette={palette} />
    </SceneCanvas>
  );
}
