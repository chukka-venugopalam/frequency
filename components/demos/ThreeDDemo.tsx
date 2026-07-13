'use client';

import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── 1. Crystal component (Rotate + Breathe) ───
function Crystal() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Slow rotation
    const rotSpeed = hovered ? 0.8 : 0.25;
    meshRef.current.rotation.x += 0.005 * rotSpeed;
    meshRef.current.rotation.y += 0.008 * rotSpeed;

    // Breathing scale: very subtle cycle between 0.98 and 1.02
    const breathe = Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
    const baseScale = hovered ? 1.25 : 1.0;
    const scale = baseScale + breathe;
    
    meshRef.current.scale.set(scale, scale, scale);
  });

  return (
    <mesh
      ref={meshRef}
      position={[-2.4, 0, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <icosahedronGeometry args={[0.9, 0]} />
      <meshPhysicalMaterial
        color="#5eead4" // Muted Teal
        roughness={0.2}
        metalness={0.1}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        transmission={0.4}
        thickness={0.5}
      />
    </mesh>
  );
}

// ─── 2. Dividing Cube component (Fracture / Reassemble) ───
function DividingCube() {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Position offsets for 8 octants of the cube
  const pieces = [
    { pos: [0.45, 0.45, 0.45], dir: [1, 1, 1] },
    { pos: [-0.45, 0.45, 0.45], dir: [-1, 1, 1] },
    { pos: [0.45, -0.45, 0.45], dir: [1, -1, 1] },
    { pos: [-0.45, -0.45, 0.45], dir: [-1, -1, 1] },
    { pos: [0.45, 0.45, -0.45], dir: [1, 1, -1] },
    { pos: [-0.45, 0.45, -0.45], dir: [-1, 1, -1] },
    { pos: [0.45, -0.45, -0.45], dir: [1, -1, -1] },
    { pos: [-0.45, -0.45, -0.45], dir: [-1, -1, -1] },
  ];

  const pieceRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame((state) => {
    if (!groupRef.current) return;

    // Slow main group rotation
    const baseRot = hovered ? 0.6 : 0.2;
    groupRef.current.rotation.y += 0.003 * baseRot;
    groupRef.current.rotation.x += 0.002 * baseRot;

    // Calculate dividing phase
    // 6-second total loop: 0s-2s merged, 2s-3s split, 3s-4.5s hold, 4.5s-5.5s reassemble, 5.5s-6s merged
    const time = state.clock.elapsedTime % 6;
    let splitFactor = 0;

    if (time > 2 && time <= 3) {
      // Split transition (ease in out)
      const t = time - 2;
      splitFactor = t * t * (3 - 2 * t);
    } else if (time > 3 && time <= 4.5) {
      // Hold split
      splitFactor = 1;
    } else if (time > 4.5 && time <= 5.5) {
      // Reassemble (ease in out)
      const t = 1 - (time - 4.5);
      splitFactor = t * t * (3 - 2 * t);
    }

    // Hover scales up split distance slightly
    const maxSplitDistance = hovered ? 0.55 : 0.38;
    const offsetDistance = splitFactor * maxSplitDistance;

    // Update positions of individual pieces
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

    // Subtly scale the whole group when hovered
    const targetScale = hovered ? 1.15 : 1.0;
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
          <boxGeometry args={[0.8, 0.8, 0.8]} />
          <meshPhysicalMaterial
            color="#c084fc" // Soft Violet
            roughness={0.3}
            metalness={0.2}
            clearcoat={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── 3. Orbiter component (Orbit / Planetary Ring System) ───
function Orbiter() {
  const groupRef = useRef<THREE.Group>(null);
  const satelliteRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!groupRef.current || !satelliteRef.current) return;

    // Slow main rotation
    const speedMultiplier = hovered ? 1.5 : 0.6;
    groupRef.current.rotation.y += 0.005 * speedMultiplier;

    // Orbit coordinates
    const time = state.clock.elapsedTime * 0.8 * speedMultiplier;
    satelliteRef.current.position.set(
      Math.sin(time) * 1.5,
      Math.sin(time * 0.5) * 0.4, // Slight vertical tilt
      Math.cos(time) * 1.5
    );

    // Subtle group breathing scale
    const breathe = Math.sin(state.clock.elapsedTime * 1.2) * 0.015;
    const baseScale = hovered ? 1.2 : 1.0;
    const scale = baseScale + breathe;
    groupRef.current.scale.set(scale, scale, scale);
  });

  return (
    <group
      ref={groupRef}
      position={[2.4, 0, 0]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Central Planet */}
      <mesh>
        <sphereGeometry args={[0.65, 32, 32]} />
        <meshPhysicalMaterial
          color="#fde047" // Soft Warm Gold
          roughness={0.4}
          metalness={0.3}
          clearcoat={0.5}
        />
      </mesh>

      {/* Planetary Ring */}
      <mesh rotation={[Math.PI / 2.5, 0, 0]}>
        <ringGeometry args={[0.85, 1.15, 64]} />
        <meshBasicMaterial
          color="#fde047"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Orbiting Satellite */}
      <mesh ref={satelliteRef}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshPhysicalMaterial
          color="#fda4af" // Soft Rose Companion
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

// ─── Main 3D Skill Demo Component ───
export default function ThreeDDemo() {
  return (
    <div
      style={{
        width: '100%',
        height: 320,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 50 }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      >
        <ambientLight intensity={0.4} />
        
        {/* Harmonious premium lighting */}
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-6, -4, 4]} intensity={0.5} color="#5eead4" />
        <pointLight position={[6, 4, 4]} intensity={0.5} color="#c084fc" />

        <Crystal />
        <DividingCube />
        <Orbiter />
      </Canvas>

      {/* Inline Subtle Instruction */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.55rem',
          color: 'var(--text-dim)',
          letterSpacing: '0.1em',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      >
        Hover elements to focus &middot; Cycle: 6s
      </div>
    </div>
  );
}
