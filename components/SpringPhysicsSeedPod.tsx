'use client';

import { useState, useRef, useEffect, Ref } from 'react';
import { motion } from 'framer-motion';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useThemeContext } from '@/app/providers';

// ─── Theme Colors Configuration for Seed Pod ───
const podColors = {
  dark: {
    active: '#c084fc',      // lavender active bloom
    inactive: '#0a3d28',    // dark green sleep
    activeEm: '#a78bfa',
    inactiveEm: '#052216',
    core: '#fbbf24',        // gold core
    stem: '#4d5c52',
    ambient: '#0f291e',
    lightA: '#fbbf24',
    lightB: '#c084fc',
  },
  light: {
    active: '#059669',      // emerald active bloom
    inactive: '#8da094',    // sage green sleep
    activeEm: '#10b981',
    inactiveEm: '#486050',
    core: '#059669',        // emerald core
    stem: '#8ba092',
    ambient: '#ccd4cc',
    lightA: '#10b981',
    lightB: '#3b82f6',
  },
  mixed: {
    active: '#a78bfa',      // twilight purple active bloom
    inactive: '#1a1835',    // deep twilight purple sleep
    activeEm: '#8b5cf6',
    inactiveEm: '#0e0b24',
    core: '#06b6d4',        // cyan core
    stem: '#54526b',
    ambient: '#161228',
    lightA: '#a78bfa',
    lightB: '#06b6d4',
  },
};

interface SeedPodProps {
  domRef: React.RefObject<HTMLDivElement | null>;
  scrollProgress: number;
  onActiveChange?: (active: boolean) => void;
}

export default function SpringPhysicsSeedPod({ domRef, scrollProgress, onActiveChange }: SeedPodProps) {
  const targetT = 0.12; // Matches targetTs[0] in DollyPath
  const diff = Math.abs(scrollProgress - targetT);

  const [isNear, setIsNear] = useState(false);
  const [prevScroll, setPrevScroll] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const { theme } = useThemeContext();
  const colors = podColors[theme] || podColors.dark;

  // Proximity hysteresis logic to prevent Intro overlaps
  // Intro is active for scrollProgress < 0.06.
  // Pod blooms when diff < 0.04 (scrollProgress >= 0.08 and <= 0.16)
  // Pod exits bloom when diff > 0.06 (scrollProgress <= 0.06 or >= 0.18)
  if (scrollProgress !== prevScroll) {
    setPrevScroll(scrollProgress);
    if (isNear) {
      if (diff > 0.06) {
        setIsNear(false);
      }
    } else {
      if (diff < 0.04) {
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
          borderRadius: '40% 40% 50% 50% / 55% 55% 45% 45%', // Bulb shell geometry
          overflow: 'hidden',
          background: 'rgba(5, 12, 8, 0.45)',
          border: isDragging
            ? '2px solid var(--accent)' // Dynamic border based on theme variables
            : isNear
            ? '1px solid var(--accent)'
            : '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: isDragging
            ? '0 0 25px var(--accent-glow)'
            : isNear
            ? '0 0 20px var(--accent-glow)'
            : '0 0 8px rgba(0, 0, 0, 0.4)',
          pointerEvents: 'auto',
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
          <ambientLight intensity={0.75} color={colors.ambient} />
          <pointLight position={[5, 5, 5]} intensity={1.8} color={colors.lightA} />
          <pointLight position={[-5, -5, 5]} intensity={0.9} color={colors.lightB} />

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
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          backdropFilter: 'blur(8px)',
          fontFamily: 'sans-serif',
          color: 'var(--text-primary)',
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
        <p style={{ margin: 0, fontSize: '0.7rem', lineHeight: 1.4, color: 'var(--text-secondary)' }}>
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
          color: isNear ? 'var(--text-primary)' : 'var(--text-dim)',
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
  const { theme } = useThemeContext();
  const colors = podColors[theme] || podColors.dark;

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

    if (isDragging) {
      meshRef.current.position.lerp(targetPos.current, 0.35);
      currentPos.current.copy(meshRef.current.position);
      velocity.current.set(0, 0, 0);
    } else {
      const displacement = new THREE.Vector3().copy(currentPos.current).negate();
      const springForce = displacement.multiplyScalar(stiffness);
      const dampingForce = new THREE.Vector3().copy(velocity.current).multiplyScalar(-damping);
      const acceleration = springForce.add(dampingForce);

      const dt = Math.min(delta, 0.03);
      velocity.current.add(acceleration.multiplyScalar(dt));
      currentPos.current.add(new THREE.Vector3().copy(velocity.current).multiplyScalar(dt));

      const dist = currentPos.current.length();
      const velLength = velocity.current.length();
      if (dist < 0.001 && velLength < 0.001) {
        currentPos.current.set(0, 0, 0);
        velocity.current.set(0, 0, 0);
      }

      meshRef.current.position.copy(currentPos.current);
    }

    if (coreRef.current) {
      coreRef.current.scale.setScalar(1.0 + Math.sin(state.clock.elapsedTime * 4.0) * 0.08);
    }
  });

  const handlePointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setIsDragging(true);

    const clickX = (pointer.x * viewport.width) / 2;
    const clickY = (pointer.y * viewport.height) / 2;
    const clickedPosition = new THREE.Vector3(clickX, clickY, 0);

    dragOffset.current.copy(clickedPosition).sub(currentPos.current);
  };

  const handlePointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!isDragging) return;
    event.stopPropagation();

    const currentX = (pointer.x * viewport.width) / 2;
    const currentY = (pointer.y * viewport.height) / 2;
    const currentMouse = new THREE.Vector3(currentX, currentY, 0);

    targetPos.current.copy(currentMouse).sub(dragOffset.current);
    targetPos.current.clampLength(0, 1.4);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <group>
      <ConnectorLine currentPos={currentPos} stemColor={colors.stem} />

      <group
        ref={meshRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <mesh visible={false}>
          <sphereGeometry args={[0.9, 16, 16]} />
        </mesh>

        {/* Outer seed pod shell */}
        <mesh scale={[1.0, 1.35, 1.0]}>
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshPhysicalMaterial
            color={isNear ? colors.active : colors.inactive}
            emissive={isNear ? colors.activeEm : colors.inactiveEm}
            emissiveIntensity={isDragging ? 1.0 : isNear ? 0.45 : 0.05}
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
            color={isNear ? colors.active : colors.inactive}
            roughness={0.2}
            metalness={0.1}
          />
        </mesh>

        {/* Glowing inner core */}
        <mesh ref={coreRef}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshBasicMaterial color={colors.core} />
        </mesh>
      </group>
    </group>
  );
}

// ─── Elastic bezier stem connector line ───
export interface ConnectorLineProps {
  currentPos: React.RefObject<THREE.Vector3>;
  stemColor: string;
}

export function ConnectorLine({ currentPos, stemColor }: ConnectorLineProps) {
  const lineRef = useRef<THREE.Line>(null);

  useFrame(() => {
    if (!lineRef.current || !currentPos.current) return;

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
      <lineBasicMaterial color={stemColor} opacity={0.55} transparent />
    </line>
  );
}
