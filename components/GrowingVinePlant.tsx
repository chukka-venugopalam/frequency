'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useThemeContext } from '@/app/providers';

// ─── Theme Colors Configuration for Growing Vine ───
const vineThemeColors = {
  dark: {
    base: new THREE.Color('#04361e'), // dark forest green
    glow: new THREE.Color('#fbbf24'), // golden amber
  },
  light: {
    base: new THREE.Color('#054525'), // emerald green base
    glow: new THREE.Color('#10b981'), // fresh green
  },
  mixed: {
    base: new THREE.Color('#1a0833'), // twilight dark violet base
    glow: new THREE.Color('#a78bfa'), // neon lavender glow
  },
};

/* ─── Procedural Growth Vine Shader ─── */
const GrowthShader = {
  uniforms: {
    uTime: { value: 0 },
    uGrowth: { value: 0 },
    uColorBase: { value: new THREE.Color('#04361e') },
    uColorGlow: { value: new THREE.Color('#fbbf24') },
  },
  vertexShader: `
    varying vec2 vUv;
    varying float vY;
    void main() {
      vUv = uv;
      vY = position.y;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    varying float vY;
    uniform float uTime;
    uniform float uGrowth;
    uniform vec3 uColorBase;
    uniform vec3 uColorGlow;

    void main() {
      // Discard pixels beyond the active growth frontier
      float progress = (vY + 1.0) * 0.5;
      if (progress > uGrowth) {
        discard;
      }

      // Organic stem gradient shifting from base green to active growth nodes
      float gradient = smoothstep(uGrowth - 0.2, uGrowth, progress);
      vec3 stemColor = mix(uColorBase, uColorGlow, gradient);

      // Add a subtle electric pulse propagating along the stem
      float pulse = sin(vY * 8.0 - uTime * 3.0) * 0.5 + 0.5;
      stemColor += uColorGlow * pulse * 0.12 * (1.0 - gradient);

      gl_FragColor = vec4(stemColor, 1.0);
    }
  `,
};

export function VineMesh({ isNear }: { isNear: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const growthRef = useRef(0);
  const { theme } = useThemeContext();
  const colors = vineThemeColors[theme] || vineThemeColors.dark;

  // Define a procedural 3D spline shape winding upward
  const vineCurve = useMemo(() => {
    const points = [];
    const numPoints = 8;
    for (let i = 0; i < numPoints; i++) {
      const angle = i * 1.5;
      const radius = 0.25 * (1.0 - i / numPoints);
      points.push(
        new THREE.Vector3(
          Math.sin(angle) * radius,
          (i / (numPoints - 1)) * 2.0 - 1.0,
          Math.cos(angle) * radius
        )
      );
    }
    return new THREE.CatmullRomCurve3(points);
  }, []);

  // Extrude spline into tube
  const tubeGeom = useMemo(() => {
    return new THREE.TubeGeometry(vineCurve, 64, 0.06, 8, false);
  }, [vineCurve]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uGrowth: { value: 0 },
    uColorBase: { value: new THREE.Color('#04361e') },
    uColorGlow: { value: new THREE.Color('#fbbf24') },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      
      const targetGrowth = isNear ? 1.0 : 0.2;
      growthRef.current = THREE.MathUtils.lerp(growthRef.current, targetGrowth, 0.04);
      materialRef.current.uniforms.uGrowth.value = growthRef.current;

      // Dynamically update colors to match theme
      materialRef.current.uniforms.uColorBase.value.lerp(colors.base, 0.1);
      materialRef.current.uniforms.uColorGlow.value.lerp(colors.glow, 0.1);
    }
  });

  return (
    <mesh geometry={tubeGeom}>
      <shaderMaterial
        ref={materialRef}
        attach="material"
        uniforms={uniforms}
        vertexShader={GrowthShader.vertexShader}
        fragmentShader={GrowthShader.fragmentShader}
      />
    </mesh>
  );
}

interface GrowingVineProps {
  position: [number, number, number];
  targetT: number;
  scrollProgress: number;
  onActiveChange?: (active: boolean) => void;
}

export default function GrowingVinePlant({ position, targetT, scrollProgress, onActiveChange }: GrowingVineProps) {
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
    const breatheRotate = Math.sin(time * 0.3) * 0.015;

    const targetScale = isNear ? 1.25 : 0.8;
    const currentScale = groupRef.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, targetScale * breatheScale, 0.08);
    groupRef.current.scale.set(nextScale, nextScale, nextScale);

    // Subtle sway
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, breatheRotate, 0.05);
  });

  return (
    <group ref={groupRef} position={position}>
      <VineMesh isNear={isNear} />

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
            background: 'var(--bg-surface)',
            padding: '4px 8px',
            borderRadius: '4px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          ✦ Spline Growth Extrusion
        </motion.div>
      </Html>
    </group>
  );
}
