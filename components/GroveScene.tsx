'use client';

import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import DollyPath from './DollyPath';
import SpringPhysicsSeedPod from './SpringPhysicsSeedPod';
import FocusCircleOverlay from './FocusCircleOverlay';
import { useThemeContext } from '@/app/providers';

interface GroveSceneProps {
  scrollRef: React.RefObject<number>;
}

// ─── Theme Configurations for R3F Scene ───
const themeColors = {
  dark: {
    bg: '#050c08',
    fog: '#050c08',
    ambient: '#143d2c',    // brighter green ambient fill to lift shadows
    light: '#fcd34d',      // warm gold sun
    foliage: '#021810',
    ground: '#03140a',
  },
  light: {
    bg: '#f4f6f2', // misty warm light green-gray
    fog: '#f4f6f2',
    ambient: '#e2e8e2',    // lighter warm sage ambient light
    light: '#10b981',      // fresh emerald directional light
    foliage: '#bcc5bb', // soft misty leaf green-gray
    ground: '#ccd2c5',     // moss-tinted light ground
  },
  mixed: {
    bg: '#0c0b18', // twilight deep dark indigo
    fog: '#0c0b18',
    ambient: '#2a1a47',    // warmer twilight purple ambient fill
    light: '#c084fc',      // brighter twilight lavender light
    foliage: '#0d081f', // deep twilight violet
    ground: '#0a0915', // twilight ground
  },
};

// ─── Procedural Foliage Silhouette Component ───
interface FoliageClusterProps {
  position: [number, number, number];
  scale: number;
  color: string;
}

function FoliageCluster({ position, scale, color }: FoliageClusterProps) {
  // Construct a branching leaf set procedurally
  const leaves = useMemo(() => {
    const temp = [];
    const count = 12;
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const angle = t * Math.PI * 0.8 - Math.PI * 0.4;
      const length = 0.5 + t * 0.8;
      temp.push({
        x: Math.sin(angle) * length,
        y: Math.cos(angle) * length - 0.2,
        z: (i % 2 === 0 ? 0.05 : -0.05),
        rotZ: -angle,
        scaleX: 0.15 + (1 - t) * 0.2,
        scaleY: 0.4 + (1 - t) * 0.5,
      });
    }
    return temp;
  }, []);

  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Central stem */}
      <mesh position={[0, 0.4, 0]}>
        <cylinderGeometry args={[0.015, 0.03, 1.2, 8]} />
        {/* Use Basic material to bypass lighting calls, keeping 60fps performance */}
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Branch leaves */}
      {leaves.map((leaf, idx) => (
        <mesh
          key={idx}
          position={[leaf.x, leaf.y + 0.4, leaf.z]}
          rotation={[0, 0, leaf.rotZ]}
          scale={[leaf.scaleX, leaf.scaleY, 0.08]}
        >
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Textured Mossy Ground Surface ───
function GroundPlane({ color }: { color: string }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, -6]} receiveShadow>
      <planeGeometry args={[70, 70]} />
      <meshStandardMaterial
        color={color}
        roughness={0.95}
        metalness={0.05}
      />
    </mesh>
  );
}

// Pure deterministic pseudo-random number generator to satisfy react-hooks/purity
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ─── Native 3D Volumetric Ambient Spore Particles ───
function AmbientParticles() {
  const count = 120;
  const pointsRef = useRef<THREE.Points>(null);
  
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const seed = i * 8;
      temp.push({
        x: (seededRandom(seed) - 0.5) * 16,
        y: (seededRandom(seed + 1) - 0.5) * 12,
        z: (seededRandom(seed + 2) - 0.5) * 30,
        vx: (seededRandom(seed + 3) - 0.5) * 0.005,
        vy: 0.002 + seededRandom(seed + 4) * 0.006,
        vz: (seededRandom(seed + 5) - 0.5) * 0.005,
        phase: seededRandom(seed + 6) * Math.PI * 2,
        speed: 0.5 + seededRandom(seed + 7) * 0.5,
      });
    }
    return temp;
  }, []);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    particles.forEach((p, i) => {
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    });
    return arr;
  }, [particles]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;

    particles.forEach((p, i) => {
      p.phase += 0.005 * p.speed;
      
      // Drift upward and sway
      pos[i * 3] += Math.sin(p.phase) * 0.002 + p.vx;
      pos[i * 3 + 1] += p.vy;
      pos[i * 3 + 2] += Math.cos(p.phase) * 0.002 + p.vz;

      // Wrap boundaries
      if (pos[i * 3 + 1] > 6) {
        pos[i * 3 + 1] = -6;
      }
      if (pos[i * 3] > 8) pos[i * 3] = -8;
      if (pos[i * 3] < -8) pos[i * 3] = 8;
      if (pos[i * 3 + 2] > 15) pos[i * 3 + 2] = -15;
      if (pos[i * 3 + 2] < -15) pos[i * 3 + 2] = 15;
    });

    geo.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#fbbf24"
        size={0.06}
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  );
}

export default function GroveScene({ scrollRef }: GroveSceneProps) {
  const seedPodDOMRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activePlant, setActivePlant] = useState<number | null>(null);
  
  const { theme } = useThemeContext();
  const colors = themeColors[theme] || themeColors.dark;

  // 15 Depth-layered background foliage silhouette placements
  const foliageData = useMemo(() => [
    // Section 1: Threshold (Z from 15 to 6)
    { pos: [3.2, -1.6, 12] as [number, number, number], scale: 2.1 },
    { pos: [-3.4, -1.4, 10] as [number, number, number], scale: 2.3 },
    { pos: [3.8, 0.4, 8] as [number, number, number], scale: 1.8 },
    { pos: [-3.8, 1.0, 6] as [number, number, number], scale: 2.2 },

    // Section 2: Canopy (Z from 6 to -6)
    { pos: [3.5, -1.8, 3] as [number, number, number], scale: 2.4 },
    { pos: [-3.6, -1.6, 1] as [number, number, number], scale: 2.6 },
    { pos: [4.2, 0.6, -2] as [number, number, number], scale: 2.0 },
    { pos: [-4.2, 1.2, -4] as [number, number, number], scale: 2.5 },
    { pos: [3.0, 1.0, -6] as [number, number, number], scale: 2.1 },

    // Section 3: Clearing (Z from -6 to -27)
    { pos: [-3.2, -1.8, -10] as [number, number, number], scale: 2.6 },
    { pos: [3.8, -1.6, -13] as [number, number, number], scale: 2.8 },
    { pos: [-4.4, 0.4, -16] as [number, number, number], scale: 2.3 },
    { pos: [4.0, 0.8, -20] as [number, number, number], scale: 2.9 },
    { pos: [-3.5, 1.4, -24] as [number, number, number], scale: 3.2 },
    { pos: [2.2, -1.0, -27] as [number, number, number], scale: 3.5 },
  ], []);

  // Manage active plant index with race-condition safe checks
  const handleActivePlantChange = (index: number, active: boolean) => {
    if (active) {
      setActivePlant(index);
    } else {
      setActivePlant((prev) => (prev === index ? null : prev));
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none', // Enforce pointer-events: none on wrapper
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'none', // Enforce pointer-events: none on Canvas element
        }}
      >
        {/* Stage 2 Ambient environment: dynamic theme color */}
        <color attach="background" args={[colors.bg]} />

        {/* Soft fog to make elements recede naturally into distance */}
        <fog attach="fog" args={[colors.fog, 4, 22]} />

        {/* Dense garden ambient light */}
        <ambientLight intensity={0.35} color={colors.ambient} />

        {/* Warm light filtering through canopy */}
        <directionalLight
          position={[12, 15, 8]}
          intensity={2.2}
          color={colors.light}
        />
        
        {/* Soft fill lighting */}
        <pointLight position={[-10, 5, -5]} intensity={0.6} color={colors.ambient} />

        {/* Procedural Ground surface */}
        <GroundPlane color={colors.ground} />

        {/* Depth-layered soft foliage backdrops */}
        {foliageData.map((f, idx) => (
          <FoliageCluster
            key={idx}
            position={f.pos}
            scale={f.scale}
            color={colors.foliage}
          />
        ))}

        {/* Drifting volumetric spores */}
        <AmbientParticles />

        <DollyPath
          scrollRef={scrollRef}
          seedPodDOMRef={seedPodDOMRef}
          setScrollProgress={setScrollProgress}
          onActivePlantChange={handleActivePlantChange}
        />
      </Canvas>

      {/* Sibling Seed Pod Canvas Overlay */}
      <SpringPhysicsSeedPod
        domRef={seedPodDOMRef}
        scrollProgress={scrollProgress}
        onActiveChange={(active) => handleActivePlantChange(0, active)}
      />

      {/* Magnified Focus Viewport and Details Overlay */}
      <FocusCircleOverlay activePlant={activePlant} />
    </div>
  );
}
