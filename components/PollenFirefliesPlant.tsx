'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Pure deterministic pseudo-random number generator to satisfy react-hooks/purity
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ─── Native 3D Orbiting Firefly Particles ───
function FireflyParticles() {
  const count = 35;
  const pointsRef = useRef<THREE.Points>(null);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const seed = i * 5;
      temp.push({
        position: new THREE.Vector3(
          (seededRandom(seed) - 0.5) * 1.6,
          (seededRandom(seed + 1) - 0.5) * 1.6,
          (seededRandom(seed + 2) - 0.5) * 1.6
        ),
        speed: 0.15 + seededRandom(seed + 3) * 0.3,
        angle: seededRandom(seed + 4) * Math.PI * 2,
      });
    }
    return temp;
  }, []);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    particles.forEach((p, i) => {
      arr[i * 3] = p.position.x;
      arr[i * 3 + 1] = p.position.y;
      arr[i * 3 + 2] = p.position.z;
    });
    return arr;
  }, [particles]);

  useFrame((state) => {
    if (!pointsRef.current) return;
    const geo = pointsRef.current.geometry;
    const pos = geo.attributes.position.array as Float32Array;

    particles.forEach((p, i) => {
      p.angle += 0.015 * p.speed;
      const offset = Math.sin(state.clock.elapsedTime * p.speed + p.angle) * 0.006;
      pos[i * 3] += Math.cos(p.angle) * offset;
      pos[i * 3 + 1] += offset * 0.8;
      pos[i * 3 + 2] += Math.sin(p.angle) * offset;
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
        size={0.11}
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  );
}

interface PollenProps {
  position: [number, number, number];
  targetT: number;
  scrollProgress: number;
  onActiveChange?: (active: boolean) => void;
}

export default function PollenFirefliesPlant({ position, targetT, scrollProgress, onActiveChange }: PollenProps) {
  const [isNear, setIsNear] = useState(false);
  const [prevScroll, setPrevScroll] = useState(0);
  const diff = Math.abs(scrollProgress - targetT);

  const groupRef = useRef<THREE.Group>(null);

  // Proximity hysteresis check
  if (scrollProgress !== prevScroll) {
    setPrevScroll(scrollProgress);
    if (isNear) {
      if (diff > 0.12) {
        setIsNear(false);
      }
    } else {
      if (diff < 0.08) {
        setIsNear(true);
      }
    }
  }

  useEffect(() => {
    if (onActiveChange) {
      onActiveChange(isNear);
    }
  }, [isNear, onActiveChange]);

  // Smooth scaling/swaying animations in frame loop
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    const breatheScale = 1.0 + Math.sin(time * 0.45) * 0.025;
    const breatheRotate = Math.sin(time * 0.3) * 0.02;

    const targetScale = isNear ? 1.25 : 0.8;
    const currentScale = groupRef.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, targetScale * breatheScale, 0.08);
    groupRef.current.scale.set(nextScale, nextScale, nextScale);

    // Subtle sway
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, breatheRotate, 0.05);
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, breatheRotate * 0.5, 0.05);
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 3D Organic Bulb Mesh */}
      <mesh>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial
          color="#0d3c26"
          roughness={0.7}
          metalness={0.2}
          bumpScale={0.05}
        />
      </mesh>

      {/* Volumetric glow shell */}
      <mesh scale={[1.15, 1.15, 1.15]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial
          color="#fbbf24"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Native 3D particles orbiting */}
      <FireflyParticles />

      {/* Identifying label */}
      <Html position={[0, -0.65, 0]} center distanceFactor={5} style={{ pointerEvents: 'none', userSelect: 'none' }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={isNear ? { opacity: 1, y: 0 } : { opacity: 0.4, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            fontFamily: 'monospace',
            fontSize: '0.62rem',
            color: isNear ? 'var(--accent)' : 'var(--text-dim)',
            letterSpacing: '0.12em',
            whiteSpace: 'nowrap',
            background: 'rgba(5, 12, 8, 0.85)',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
        >
          ✦ Brownian Dust Particles
        </motion.div>
      </Html>
    </group>
  );
}
