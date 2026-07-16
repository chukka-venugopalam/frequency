'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Water Ripple GLSL Shader ─── */
const WaterShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform float uTime;
    uniform vec2 uMouse;

    void main() {
      vec2 uv = vUv;
      vec2 mouse = uMouse;

      float dist = distance(uv, mouse);
      // Continuous organic wave ripples
      float ripple = sin(dist * 20.0 - uTime * 2.0) * 0.02 / (dist * 1.5 + 0.4);
      vec2 distortedUv = uv + (uv - mouse) * ripple;

      // Organic pool deep green-blue gradients
      float r = 0.02 * (0.5 + 0.5 * sin(distortedUv.x * 2.0 + uTime * 0.2));
      float g = 0.48 * (0.5 + 0.5 * sin(distortedUv.y * 3.0 + uTime * 0.3));
      float b = 0.42 * (0.5 + 0.5 * sin((distortedUv.x + distortedUv.y) * 2.0 + uTime * 0.15));

      // Gentle pool glow
      float glow = 0.08 / (dist * 2.0 + 0.2);
      g += glow * 0.2;
      b += glow * 0.2;

      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
};

export function ShaderQuad() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { pointer } = useThree();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Normalise pointer (-1 to 1) into UV space (0 to 1)
      materialRef.current.uniforms.uMouse.value.set(
        pointer.x * 0.5 + 0.5,
        pointer.y * 0.5 + 0.5
      );
    }
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[1.7, 1.7]} />
      <shaderMaterial
        ref={materialRef}
        attach="material"
        uniforms={uniforms}
        vertexShader={WaterShader.vertexShader}
        fragmentShader={WaterShader.fragmentShader}
      />
    </mesh>
  );
}

interface DewLeafProps {
  position: [number, number, number];
  targetT: number;
  scrollProgress: number;
  onActiveChange?: (active: boolean) => void;
}

export default function DewLeafPlant({ position, targetT, scrollProgress, onActiveChange }: DewLeafProps) {
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
    const breatheScale = 1.0 + Math.sin(time * 0.4) * 0.02;
    const breatheRotate = Math.sin(time * 0.35) * 0.015;

    const targetScale = isNear ? 1.25 : 0.8;
    const currentScale = groupRef.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, targetScale * breatheScale, 0.08);
    groupRef.current.scale.set(nextScale, nextScale, nextScale);
    
    // Slight sway on Y axis
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, breatheRotate, 0.05);
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 3D Stone Basin Platform */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 0]}>
        <cylinderGeometry args={[0.9, 0.95, 0.18, 32]} />
        <meshStandardMaterial color="#081c11" roughness={0.8} metalness={0.15} />
      </mesh>

      {/* Refractive Water Surface Disk */}
      <group position={[0, -0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ShaderQuad />
      </group>

      {/* Elegant identifying label */}
      <Html position={[0, -0.7, 0]} center distanceFactor={5} style={{ pointerEvents: 'none', userSelect: 'none' }}>
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
          ✦ GPU Fluid Ripples
        </motion.div>
      </Html>
    </group>
  );
}
