'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── 1. Crystal Seed-Pod (Rotate + Breathe) ───
export function CrystalSeed() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.45;
      const breathe = 1.0 + Math.sin(state.clock.elapsedTime * 2.0) * 0.04;
      meshRef.current.scale.set(breathe, breathe, breathe);
    }
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <icosahedronGeometry args={[0.38, 0]} />
      <meshStandardMaterial
        color={hovered ? '#f59e0b' : '#d97706'} // Warm golden transition
        emissive={hovered ? '#fbbf24' : '#b45309'}
        emissiveIntensity={1.2}
        roughness={0.1}
        metalness={0.9}
      />
    </mesh>
  );
}

// ─── 2. Dividing Capsule (Fracture / Reassemble) ───
export function DividingCapsule() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = state.clock.elapsedTime * -0.25;

    // Fracture displacement offset
    const time = state.clock.elapsedTime;
    const splitOffset = hovered
      ? 0.5 + Math.sin(time * 6.0) * 0.05 // Fidget fracture
      : 0.15 + Math.sin(time * 1.5) * 0.1; // Slow breathing fracture

    // Apply offset to left and right halves
    const left = groupRef.current.children[0] as THREE.Mesh;
    const right = groupRef.current.children[1] as THREE.Mesh;
    if (left && right) {
      left.position.x = -splitOffset;
      right.position.x = splitOffset;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Left Capsule half */}
      <mesh position={[-0.2, 0, 0]}>
        <sphereGeometry args={[0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#3b82f6"
          roughness={0.2}
          metalness={0.1}
          transmission={0.6}
          thickness={0.5}
        />
      </mesh>
      {/* Right Capsule half */}
      <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI]}>
        <sphereGeometry args={[0.22, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color="#a855f7"
          roughness={0.2}
          metalness={0.1}
          transmission={0.6}
          thickness={0.5}
        />
      </mesh>
    </group>
  );
}

// ─── 3. Orbiting Spore (Orbit companion) ───
export function OrbitingSpore() {
  const groupRef = useRef<THREE.Group>(null);
  const satelliteRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.9;
    }
    if (satelliteRef.current) {
      satelliteRef.current.rotation.x = state.clock.elapsedTime * 1.5;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <mesh
        ref={satelliteRef}
        position={[0.7, 0, 0]}
      >
        <octahedronGeometry args={[0.08, 0]} />
        <meshStandardMaterial
          color={hovered ? '#a78bfa' : '#6d28d9'}
          emissive={hovered ? '#c084fc' : '#4c1d95'}
          emissiveIntensity={1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </group>
  );
}

interface SeedClusterProps {
  position: [number, number, number];
  targetT: number;
  scrollProgress: number;
  onActiveChange?: (active: boolean) => void;
}

export default function BuddingSeedClusterPlant({ position, targetT, scrollProgress, onActiveChange }: SeedClusterProps) {
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

  // Smooth lerp animations in frame loop
  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    const breatheScale = 1.0 + Math.sin(time * 0.4) * 0.02;
    const breatheRotate = Math.sin(time * 0.3) * 0.02;

    const targetScale = isNear ? 1.25 : 0.8;
    const currentScale = groupRef.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, targetScale * breatheScale, 0.08);
    groupRef.current.scale.set(nextScale, nextScale, nextScale);

    // Subtle sway
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, breatheRotate, 0.05);
  });

  return (
    <group ref={groupRef} position={position}>
      <CrystalSeed />
      <DividingCapsule />
      <OrbitingSpore />

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
          ✦ 3D Crystal Cluster
        </motion.div>
      </Html>
    </group>
  );
}
