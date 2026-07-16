'use client';

import { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import DollyPath from './DollyPath';
import SpringPhysicsSeedPod from './SpringPhysicsSeedPod';
import FocusCircleOverlay from './FocusCircleOverlay';

interface GroveSceneProps {
  scrollRef: React.RefObject<number>;
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
        {/* Stage 2 Ambient environment: soft deep green-black */}
        <color attach="background" args={['#050c08']} />

        {/* Soft fog to make elements recede naturally into distance */}
        <fog attach="fog" args={['#050c08', 4, 22]} />

        {/* Dense garden ambient light */}
        <ambientLight intensity={0.3} color="#0f291e" />

        {/* Warm golden light filtering through trees */}
        <directionalLight
          position={[12, 15, 8]}
          intensity={2.2}
          color="#fcd34d" // Warm gold / low sun
        />
        
        {/* Soft fill lighting */}
        <pointLight position={[-10, 5, -5]} intensity={0.6} color="#050c08" />

        {/* Drifting volumetric spores */}
        <AmbientParticles />

        <DollyPath
          scrollRef={scrollRef}
          seedPodDOMRef={seedPodDOMRef}
          setScrollProgress={setScrollProgress}
          onActivePlantChange={handleActivePlantChange}
        />
      </Canvas>

      {/* Sibling Seed Pod Canvas Overlay (Sibling rendering context, not nested inside the main Canvas) */}
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

