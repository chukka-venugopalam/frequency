'use client';

import { useState, useRef, useEffect, Ref } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

interface SeedPodProps {
  domRef: React.RefObject<HTMLDivElement | null>;
  scrollProgress: number;
  onActiveChange?: (active: boolean) => void;
}

export default function SpringPhysicsSeedPod({ domRef, scrollProgress, onActiveChange }: SeedPodProps) {
  const targetT = 0;
  const diff = Math.abs(scrollProgress - targetT);

  const [isNear, setIsNear] = useState(false);
  const [prevScroll, setPrevScroll] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Proximity hysteresis logic
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

  return (
    <div
      ref={domRef}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: 300,
        height: 300,
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        transformOrigin: 'center center',
        zIndex: 5,
      }}
    >
      {/* 3D WebGL Canvas container */}
      <motion.div
        style={{
          width: 130,
          height: 130,
          borderRadius: '40% 40% 50% 50% / 55% 55% 45% 45%', // Bulb / Seed-pod geometry shell
          overflow: 'hidden',
          background: 'rgba(5, 12, 8, 0.45)',
          border: isDragging
            ? '2px solid var(--accent)' // Golden highlight on active drag
            : isNear
            ? '1px solid hsl(268, 70%, 85%)'
            : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isDragging
            ? '0 0 25px var(--accent)' // Golden glow
            : isNear
            ? '0 0 20px rgba(167, 139, 250, 0.35)' // Lavender glow
            : '0 0 8px rgba(0, 0, 0, 0.4)',
          pointerEvents: 'auto', // Enable pointer actions on the interactive pod
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        animate={
          isNear
            ? {
                scale: [1, 1.04, 1],
                rotate: [0, 1, -1, 0],
              }
            : {
                scale: [0.82, 0.86, 0.82],
                rotate: [0, 0.3, -0.3, 0],
              }
        }
        transition={
          isNear
            ? {
                scale: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
                type: 'spring',
                stiffness: 120,
                damping: 12,
              }
            : {
                scale: { duration: 14, repeat: Infinity, ease: 'easeInOut' },
                rotate: { duration: 16, repeat: Infinity, ease: 'easeInOut' },
              }
        }
      >
        <Canvas
          camera={{ position: [0, 0, 3.5], fov: 50 }}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
          }}
        >
          <ambientLight intensity={0.7} color="#0f291e" />
          <pointLight position={[5, 5, 5]} intensity={1.8} color="#fbbf24" />
          <pointLight position={[-5, -5, 5]} intensity={0.9} color="#c084fc" />

          <InteractiveSeedPodMesh
            isNear={isNear}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
          />
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
          background: 'rgba(5, 12, 8, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '8px',
          backdropFilter: 'blur(8px)',
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
          SPRING PHYSICS
        </h4>
        <p style={{ margin: 0, fontSize: '0.7rem', lineHeight: 1.4, color: '#8e9c93' }}>
          Interactive force bulb using real-time spring physics. Simulates natural weight and momentum on drag release. Ideal for menus, responsive sliders, and tactile card gestures.
        </p>
      </motion.div>

      {/* Absolute text HUD overlay on the seed pod */}
      <div
        style={{
          position: 'absolute',
          bottom: 'calc(50% - 58px)',
          fontSize: '0.55rem',
          fontFamily: 'monospace',
          color: isNear ? '#ffffff' : '#9ca3af',
          opacity: 0.65,
          userSelect: 'none',
          pointerEvents: 'none',
          textAlign: 'center',
        }}
      >
        {isDragging ? 'FLING' : 'DRAG'}
      </div>
    </div>
  );
}

// ─── 3D Mesh Component inside the Local Canvas ───
export interface InteractiveMeshProps {
  isNear: boolean;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
}

export function InteractiveSeedPodMesh({ isNear, isDragging, setIsDragging }: InteractiveMeshProps) {
  const { viewport, pointer } = useThree();
  const meshRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);

  // Position and Physics references
  const currentPos = useRef(new THREE.Vector3(0, 0, 0));
  const targetPos = useRef(new THREE.Vector3(0, 0, 0));
  const velocity = useRef(new THREE.Vector3(0, 0, 0));
  const dragOffset = useRef(new THREE.Vector3(0, 0, 0));

  // Physics constants
  const stiffness = 380;
  const damping = 26;

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Fling/drag movement or Euler spring integrations
    if (isDragging) {
      // currentPos tracks mesh position; Euler calculations handle velocity damping on release
      meshRef.current.position.lerp(targetPos.current, 0.35);
      currentPos.current.copy(meshRef.current.position);
      velocity.current.set(0, 0, 0); // Clear velocity while actively dragging
    } else {
      // Spring force vector: F = -k * x
      const displacement = new THREE.Vector3().copy(currentPos.current).negate();
      const springForce = displacement.multiplyScalar(stiffness);

      // Damping force vector: F = -c * v
      const dampingForce = new THREE.Vector3().copy(velocity.current).multiplyScalar(-damping);

      // Net force: F = springForce + dampingForce (with Mass m = 1.0)
      const acceleration = springForce.add(dampingForce);

      // Euler integration
      const dt = Math.min(delta, 0.03); // Cap delta to prevent physics explosions on lag spikes
      velocity.current.add(acceleration.multiplyScalar(dt));
      currentPos.current.add(new THREE.Vector3().copy(velocity.current).multiplyScalar(dt));

      // Threshold check: snap seed pod to rest and halt oscillations
      const dist = currentPos.current.length();
      const velLength = velocity.current.length();
      if (dist < 0.001 && velLength < 0.001) {
        currentPos.current.set(0, 0, 0);
        velocity.current.set(0, 0, 0);
      }

      meshRef.current.position.copy(currentPos.current);
    }

    // Subtle breathing / idle wobble when resting
    if (isNear && !isDragging) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 1.2) * 0.05;
    } else {
      meshRef.current.rotation.set(0, 0, 0);
    }

    // Animate inner core scale based on proximity
    if (coreRef.current) {
      const targetScale = isNear ? (isDragging ? 1.4 : 1.0) : 0.0;
      const currentScale = coreRef.current.scale.x;
      const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.15);
      coreRef.current.scale.set(nextScale, nextScale, nextScale);
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    const target = e.target as HTMLElement;
    if (target && typeof target.setPointerCapture === 'function') {
      target.setPointerCapture(e.pointerId);
    }
    setIsDragging(true);

    // Click intersection point projected on Z=0 plane relative to camera view
    const clickX = (pointer.x * viewport.width) / 2;
    const clickY = (pointer.y * viewport.height) / 2;
    dragOffset.current.set(clickX - currentPos.current.x, clickY - currentPos.current.y, 0);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    e.stopPropagation();

    // Map screen mouse position directly to Z=0 viewport space
    const cursorX = (pointer.x * viewport.width) / 2;
    const cursorY = (pointer.y * viewport.height) / 2;
    const newTarget = new THREE.Vector3(cursorX - dragOffset.current.x, cursorY - dragOffset.current.y, 0);

    // Constrain drag to local radius range
    const maxRadius = 1.3;
    if (newTarget.length() > maxRadius) {
      newTarget.normalize().multiplyScalar(maxRadius);
    }

    targetPos.current.copy(newTarget);
  };

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(false);
    
    const target = e.target as HTMLElement;
    if (target && typeof target.releasePointerCapture === 'function') {
      target.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <group>
      {/* Elastic connector stem line stretching from origin to seed pod */}
      <ConnectorLine currentPos={currentPos} />

      <group
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Invisible expanded hit area mesh to make dragging easier */}
        <mesh visible={false}>
          <sphereGeometry args={[0.9, 16, 16]} />
        </mesh>

        {/* Outer seed pod shell - Ellipsoid geometry */}
        <mesh scale={[1.0, 1.35, 1.0]}>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshPhysicalMaterial
            color={isNear ? '#c084fc' : '#4b5563'} // Lavender when active, grey sleep
            emissive={isNear ? '#a78bfa' : '#1f2937'}
            emissiveIntensity={isDragging ? 0.9 : isNear ? 0.35 : 0.05}
            roughness={0.15}
            metalness={0.1}
            transparent
            opacity={0.8}
            transmission={0.4}
            thickness={0.5}
          />
        </mesh>

        {/* Outer tip */}
        <mesh position={[0, 0.55, 0]}>
          <coneGeometry args={[0.07, 0.22, 16]} />
          <meshStandardMaterial
            color={isNear ? '#c084fc' : '#4b5563'}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {/* Glowing inner core */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      </group>
    </group>
  );
}

// ─── Elastic bezier stem connector line ───
export interface ConnectorLineProps {
  currentPos: React.RefObject<THREE.Vector3>;
}

export function ConnectorLine({ currentPos }: ConnectorLineProps) {
  const lineRef = useRef<THREE.Line>(null);

  useFrame(() => {
    if (!lineRef.current || !currentPos.current) return;

    // Anchor at bottom center, curve up towards seed pod position
    const anchor = new THREE.Vector3(0, -1.6, 0);
    const control = new THREE.Vector3(0, -0.8, 0);
    const end = currentPos.current;

    const curve = new THREE.QuadraticBezierCurve3(anchor, control, end);
    const points = curve.getPoints(16);

    lineRef.current.geometry.setFromPoints(points);
  });

  return (
    <line ref={lineRef as unknown as Ref<SVGLineElement>}>
      <bufferGeometry />
      <lineBasicMaterial color="#4d5c52" opacity={0.55} transparent />
    </line>
  );
}
