'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Html } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── 1. Crystal Seed-Pod (Rotate + Breathe) ───
function CrystalSeed() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const speed = hovered ? 1.0 : 0.3;
    meshRef.current.rotation.x += 0.005 * speed;
    meshRef.current.rotation.y += 0.008 * speed;

    const breathe = Math.sin(state.clock.elapsedTime * 1.5) * 0.03;
    const baseScale = hovered ? 1.25 : 1.0;
    const scale = baseScale + breathe;
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh
      ref={meshRef}
      position={[-1.2, 0, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <icosahedronGeometry args={[0.45, 0]} />
      <meshStandardMaterial
        color="#fbbf24" // Warm Gold
        roughness={0.3}
        metalness={0.1}
        emissive="#fbbf24"
        emissiveIntensity={hovered ? 0.6 : 0.15}
      />
    </mesh>
  );
}

// ─── 2. Dividing Capsule (Fracture / Reassemble) ───
function DividingCapsule() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  const pieces = [
    { pos: [0.18, 0, 0.18], dir: [1, 0, 1] },
    { pos: [-0.18, 0, 0.18], dir: [-1, 0, 1] },
    { pos: [0.18, 0, -0.18], dir: [1, 0, -1] },
    { pos: [-0.18, 0, -0.18], dir: [-1, 0, -1] },
  ];

  const pieceRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const speed = hovered ? 1.2 : 0.4;
    groupRef.current.rotation.y += 0.006 * speed;

    // 6-second total loop: 0s-2s merged, 2s-3.5s split, 3.5s-4.5s hold, 4.5s-5.5s reassemble, 5.5s-6s merged
    const time = state.clock.elapsedTime % 6;
    let splitFactor = 0;

    if (time > 2 && time <= 3.5) {
      const t = (time - 2) / 1.5;
      splitFactor = t * t * (3 - 2 * t);
    } else if (time > 3.5 && time <= 4.5) {
      splitFactor = 1;
    } else if (time > 4.5 && time <= 5.5) {
      const t = 1 - (time - 4.5);
      splitFactor = t * t * (3 - 2 * t);
    }

    const offsetDistance = splitFactor * (hovered ? 0.35 : 0.22);

    pieces.forEach((piece, index) => {
      const mesh = pieceRefs.current[index];
      if (mesh) {
        mesh.position.set(
          piece.pos[0] + piece.dir[0] * offsetDistance,
          piece.pos[1] + piece.dir[1] * offsetDistance,
          piece.pos[2] + piece.dir[2] * offsetDistance
        );
      }
    });

    const targetScale = hovered ? 1.2 : 1.0;
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  return (
    <group
      ref={groupRef}
      position={[0, 0, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {pieces.map((piece, index) => (
        <mesh
          key={index}
          ref={(el) => {
            pieceRefs.current[index] = el;
          }}
        >
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial
            color="#c084fc" // Soft Lavender
            roughness={0.4}
            metalness={0.2}
            emissive="#c084fc"
            emissiveIntensity={hovered ? 0.5 : 0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── 3. Orbiting Spore (Orbit companion) ───
function OrbitingSpore() {
  const groupRef = useRef<THREE.Group>(null);
  const satelliteRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!groupRef.current || !satelliteRef.current) return;
    const speed = hovered ? 1.8 : 0.7;
    groupRef.current.rotation.y += 0.004 * speed;

    const time = state.clock.elapsedTime * 0.9 * speed;
    satelliteRef.current.position.set(
      Math.sin(time) * 0.75,
      Math.sin(time * 0.5) * 0.2,
      Math.cos(time) * 0.75
    );

    const breathe = Math.sin(state.clock.elapsedTime * 1.2) * 0.02;
    const baseScale = hovered ? 1.2 : 1.0;
    const scale = baseScale + breathe;
    groupRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group
      ref={groupRef}
      position={[1.2, 0, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Central Core */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color="#fda4af" // Blush Pink
          roughness={0.3}
          metalness={0.1}
          emissive="#fda4af"
          emissiveIntensity={hovered ? 0.6 : 0.15}
        />
      </mesh>

      {/* Orbit Spore */}
      <mesh ref={satelliteRef}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
    </group>
  );
}

interface SeedClusterProps {
  position: [number, number, number];
  targetT: number;
  scrollProgress: number;
}

export default function BuddingSeedClusterPlant({ position, targetT, scrollProgress }: SeedClusterProps) {
  const [isNear, setIsNear] = useState(false);
  const [prevScroll, setPrevScroll] = useState(0);
  const diff = Math.abs(scrollProgress - targetT);

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

  return (
    <Html
      position={position}
      center
      distanceFactor={6}
      style={{
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 300,
          height: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          pointerEvents: 'none',
        }}
      >
        {/* Cluster container */}
        <motion.div
          style={{
            width: 100,
            height: 90,
            borderRadius: '25% 65% 35% 55% / 60% 40% 50% 50%', // Organic cluster shell
            overflow: 'hidden',
            background: 'rgba(5, 12, 8, 0.45)',
            border: isNear
              ? '1px solid hsl(268, 70%, 80%)' // Lavender bloom highlight
              : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: isNear
              ? '0 0 22px rgba(167, 139, 250, 0.25)' // Lavender glow
              : '0 0 8px rgba(0, 0, 0, 0.4)',
            pointerEvents: 'auto', // Enable pointer events for 3D interactions
          }}
          animate={
            isNear
              ? {
                  scale: [1, 1.03, 1],
                  rotate: [0, -2, 2, 0],
                }
              : { scale: 0.85 }
          }
          transition={
            isNear
              ? {
                  scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
                  type: 'spring',
                  stiffness: 100,
                  damping: 15,
                }
              : { type: 'spring', stiffness: 90, damping: 20 }
          }
        >
          <Canvas
            camera={{ position: [0, 0, 3], fov: 60 }}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[5, 5, 5]} intensity={1.5} color="#fbbf24" />
            <pointLight position={[-5, -5, 5]} intensity={0.8} color="#c084fc" />
            
            <CrystalSeed />
            <DividingCapsule />
            <OrbitingSpore />
          </Canvas>
        </motion.div>

        {/* Description Panel overlay */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={isNear ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: 190,
            width: 220,
            padding: '14px',
            background: 'rgba(5, 12, 8, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '8px',
            backdropFilter: 'blur(6px)',
            fontFamily: 'sans-serif',
            color: '#f4f6f4',
            pointerEvents: isNear ? 'auto' : 'none',
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
            textAlign: 'left',
          }}
        >
          <h4
            style={{
              margin: '0 0 6px 0',
              fontSize: '0.8rem',
              color: 'var(--accent)',
              fontFamily: 'monospace',
              letterSpacing: '0.05em',
            }}
          >
            SPHAERAL CLUSTER
          </h4>
          <p style={{ margin: 0, fontSize: '0.7rem', lineHeight: 1.4, color: '#8e9c93' }}>
            Multi-object WebGL cluster rendering icosahedrons, orbit paths, and fracture coordinates. Showcases 3D standard materials with custom emissive reactions. Perfect for interactive product views and data displays.
          </p>
        </motion.div>
      </div>
    </Html>
  );
}
