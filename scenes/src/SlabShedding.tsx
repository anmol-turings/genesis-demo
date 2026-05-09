import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import * as THREE from 'three';

const ARCHETYPE_COLORS: Record<string, { warm: string; warmHi: string; shadow: string }> = {
  stoic:     { warm: '#c9a84c', warmHi: '#f5d99a', shadow: '#c97575' },
  alchemist: { warm: '#a06ac4', warmHi: '#cda8e0', shadow: '#c97575' },
  explorer:  { warm: '#5fa0d4', warmHi: '#9bc4e3', shadow: '#c97575' },
  healer:    { warm: '#7abcae', warmHi: '#a8d4c9', shadow: '#c97575' },
  monk:      { warm: '#4a9c8a', warmHi: '#8cc0b3', shadow: '#c97575' },
  craftsman: { warm: '#c4884a', warmHi: '#e3b07c', shadow: '#c97575' },
};
const colorFor = (id: string) => ARCHETYPE_COLORS[id] || ARCHETYPE_COLORS.stoic;

const SLAB_DEFS = [
  { pos: [ 0.62, -1.10,  0.18], size: [0.55, 0.32, 0.20], rot: [ 0.10,  0.45,  0.05], dropAt: 3.0 },
  { pos: [-0.55, -0.40, -0.22], size: [0.50, 0.28, 0.18], rot: [-0.08, -0.55,  0.00], dropAt: 4.3 },
  { pos: [ 0.52,  0.20, -0.32], size: [0.40, 0.24, 0.16], rot: [ 0.05,  0.65, -0.12], dropAt: 5.5 },
  { pos: [-0.46,  0.75,  0.22], size: [0.38, 0.22, 0.14], rot: [-0.10, -0.40,  0.06], dropAt: 6.7 },
  { pos: [ 0.40,  1.25,  0.12], size: [0.32, 0.20, 0.13], rot: [ 0.05,  0.50,  0.00], dropAt: 7.9 },
  { pos: [-0.34,  1.70, -0.16], size: [0.28, 0.18, 0.12], rot: [-0.05, -0.60,  0.05], dropAt: 9.1 },
];

function slabTransform(def: typeof SLAB_DEFS[0], idx: number, t: number) {
  if (t < def.dropAt) {
    const tense = 0.99 + 0.01 * Math.sin(t * 1.4 + idx * 0.7);
    return {
      position: def.pos as [number, number, number],
      rotation: def.rot as [number, number, number],
      scale: tense,
      opacity: 0.88,
    };
  }
  const dropT = t - def.dropAt;
  const lateralX = (idx % 2 === 0 ? 1 : -1) * 0.35;
  const lateralZ = idx % 3 === 0 ? 0.20 : -0.20;
  return {
    position: [
      def.pos[0] + lateralX * Math.min(1, dropT * 0.6),
      def.pos[1] - 0.5 * 9.4 * dropT * dropT,
      def.pos[2] + lateralZ * Math.min(1, dropT * 0.6),
    ] as [number, number, number],
    rotation: [
      def.rot[0] + dropT * 1.6,
      def.rot[1] + dropT * 1.3,
      def.rot[2] + dropT * 0.9,
    ] as [number, number, number],
    scale: 1,
    opacity: Math.max(0, 0.88 - dropT * 0.55),
  };
}

function cameraTransform(t: number) {
  return {
    position: [
      Math.sin(t * 0.12) * 0.18,
      0.42 + Math.sin(t * 0.4) * 0.06,
      5.5 - Math.min(t, 14) * 0.07,
    ] as [number, number, number],
    lookAt: [0, 0.18, 0] as [number, number, number],
  };
}

function columnState(t: number) {
  const shed = SLAB_DEFS.filter((s) => t > s.dropAt).length / SLAB_DEFS.length;
  const breath = 0.95 + 0.05 * Math.sin(t * 0.95);
  return {
    coreIntensity: 1.5 + shed * 2.4 + Math.sin(t * 1.4) * 0.25,
    coreScale: breath * 0.20,
    innerIntensity: 0.25 + shed * 1.4,
    innerRotY: t * 0.04 + shed * 0.6,
    shellOpacity: 0.16 + shed * 0.20,
    shellRotY: -t * 0.03,
    crownIntensity: 0.4 + shed * 1.8,
    crownRotY: -t * 0.08,
    baseIntensity: 0.25 + shed * 1.4,
    bandIntensity: 0.30 + shed * 1.1,
  };
}

const Scene: React.FC<{ archetypeId: string }> = ({ archetypeId }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const palette = colorFor(archetypeId);
  const cam = cameraTransform(t);
  const col = columnState(t);

  return (
    <>
      <perspectiveCamera
        makeDefault
        fov={38}
        position={cam.position}
        onUpdate={(self: THREE.PerspectiveCamera) => {
          self.lookAt(...cam.lookAt);
        }}
      />

      <ambientLight intensity={0.12} />
      <directionalLight color="#f5e0c8" intensity={1.5} position={[3, 5, 4]} />
      <directionalLight color={palette.warmHi} intensity={0.75} position={[-4, 2, -2]} />
      <pointLight color={palette.warmHi} intensity={1.4} position={[0, 0.5, 0]} distance={3.2} decay={2} />

      <mesh position={[0, 0.20, 0]} scale={col.coreScale}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial
          color="#3a2a14"
          emissive={palette.warmHi}
          emissiveIntensity={col.coreIntensity}
          metalness={0.65}
          roughness={0.18}
        />
      </mesh>

      <mesh position={[0, 0.20, 0]} rotation={[0, col.innerRotY, 0]}>
        <cylinderGeometry args={[0.22, 0.32, 3.0, 24, 1]} />
        <meshStandardMaterial
          color="#1a140a"
          emissive={palette.warm}
          emissiveIntensity={col.innerIntensity}
          roughness={0.42}
          metalness={0.45}
        />
      </mesh>

      <mesh position={[0, 0.20, 0]} rotation={[0, col.shellRotY, 0]}>
        <cylinderGeometry args={[0.34, 0.44, 3.1, 28, 1]} />
        <meshPhysicalMaterial
          color={palette.warm}
          transparent
          opacity={col.shellOpacity}
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
          position={[0, y + 0.20, 0]}
          rotation={[Math.PI / 2, 0, t * (i % 2 === 0 ? 0.06 : -0.06)]}
        >
          <torusGeometry args={[0.30, 0.014, 10, 36]} />
          <meshStandardMaterial
            color="#1a1408"
            emissive={palette.warmHi}
            emissiveIntensity={col.bandIntensity}
            metalness={0.55}
            roughness={0.2}
          />
        </mesh>
      ))}

      <mesh position={[0, 1.84, 0]} rotation={[Math.PI / 2, 0, col.crownRotY]}>
        <torusGeometry args={[0.22, 0.026, 10, 32]} />
        <meshStandardMaterial
          color="#1a1408"
          emissive={palette.warmHi}
          emissiveIntensity={col.crownIntensity}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>

      <mesh position={[0, -1.32, 0]}>
        <cylinderGeometry args={[0.46, 0.50, 0.08, 28]} />
        <meshStandardMaterial
          color="#1a1408"
          emissive={palette.warm}
          emissiveIntensity={col.baseIntensity}
          metalness={0.6}
          roughness={0.32}
        />
      </mesh>

      {SLAB_DEFS.map((def, idx) => {
        const tr = slabTransform(def, idx, t);
        return (
          <mesh
            key={idx}
            position={tr.position}
            rotation={tr.rotation}
            scale={tr.scale}
          >
            <boxGeometry args={def.size as [number, number, number]} />
            <meshStandardMaterial
              color="#1a1814"
              roughness={0.88}
              metalness={0.18}
              transparent
              opacity={tr.opacity}
            />
          </mesh>
        );
      })}

      {SLAB_DEFS.flatMap((def, slabIdx) =>
        Array.from({ length: 8 }, (_, i) => {
          const seed = (slabIdx * 7 + i) * 0.7919;
          const angle = (seed * 6.28) % 6.28;
          const speed = 0.4 + ((seed * 13) % 1) * 0.6;
          const delay = ((seed * 17) % 1) * 0.5;
          const dropT = t - def.dropAt - delay;
          if (dropT <= 0 || dropT > 1.5) return null;
          const rad = dropT * speed;
          const opacity = Math.max(0, 0.55 * (1 - dropT / 1.5));
          return (
            <mesh
              key={`${slabIdx}-${i}`}
              position={[
                def.pos[0] + Math.cos(angle) * rad,
                def.pos[1] + Math.sin(angle) * rad * 0.4 - dropT * 0.3,
                def.pos[2] + Math.sin(angle) * rad,
              ]}
            >
              <sphereGeometry args={[0.022, 6, 6]} />
              <meshStandardMaterial
                color="#1a1408"
                emissive={palette.warmHi}
                emissiveIntensity={1.6}
                transparent
                opacity={opacity}
              />
            </mesh>
          );
        })
      )}

      {Array.from({ length: 80 }, (_, i) => {
        const seed = i * 0.4421;
        const px = (((seed * 31) % 1) - 0.5) * 14;
        const py = (((seed * 17) % 1) - 0.5) * 10;
        const pz = (((seed * 23) % 1) - 0.5) * 8 - 2;
        const breath = 0.4 + 0.6 * ((Math.sin(t * 0.8 + seed * 7) + 1) / 2);
        return (
          <mesh key={`atmo-${i}`} position={[px, py, pz]}>
            <sphereGeometry args={[0.025, 4, 4]} />
            <meshBasicMaterial color={palette.warmHi} transparent opacity={breath * 0.35} />
          </mesh>
        );
      })}

      <fog attach="fog" args={['#0a0814', 5, 22]} />
    </>
  );
};

type Props = { archetypeId?: string };

export const SlabShedding: React.FC<Props> = ({ archetypeId = 'stoic' }) => {
  const { width, height } = useVideoConfig();
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#04040a' }}>
      <ThreeCanvas width={width} height={height} linear>
        <Scene archetypeId={archetypeId} />
      </ThreeCanvas>
    </div>
  );
};
