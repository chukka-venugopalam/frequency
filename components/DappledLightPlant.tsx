'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Html } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Dappled Foliage Shadow Projection Shader ─── */
const DappledShader = {
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    varying vec3 vNormal;
    uniform float uTime;
    uniform vec2 uMouse;

    // Simulates natural organic leaves shadow masks
    float leafNoise(vec2 p, float time) {
      float shadow = sin(p.x * 6.0 + sin(time * 0.4)) * cos(p.y * 6.0 + cos(time * 0.5));
      shadow += sin(p.x * 12.0 - time * 0.8) * cos(p.y * 14.0 + time * 0.6) * 0.35;
      shadow += sin(p.x * 24.0 + time * 1.6) * cos(p.y * 22.0 - time * 1.2) * 0.15;
      return shadow;
    }

    void main() {
      vec2 uv = vUv;
      
      // Dynamic shift relative to screen mouse position
      uv += uMouse * 0.08;

      float shadowMask = leafNoise(uv * 1.8, uTime);
      // Map noise into a clean sharp dappled shadow edge
      float shadow = smoothstep(-0.25, 0.45, shadowMask);

      // Warm ambient leaf backlight color palette
      vec3 lightColor = vec3(0.96, 0.78, 0.15); // Warm gold sunray
      vec3 shadowColor = vec3(0.02, 0.08, 0.04); // Deep green foliage shade

      // Direct light diffusion scaling relative to surface normal
      float diffuse = max(dot(vNormal, normalize(vec3(3.0, 3.0, 3.0))), 0.0);
      vec3 finalColor = mix(shadowColor, lightColor * (diffuse + 0.3), shadow);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};

export function DappleSphere() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { pointer } = useThree();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Lerp mouse coordinates to smooth shadow movement
      materialRef.current.uniforms.uMouse.value.lerp(pointer, 0.08);
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[0.55, 32, 32]} />
      <shaderMaterial
        ref={materialRef}
        attach="material"
        uniforms={uniforms}
        vertexShader={DappledShader.vertexShader}
        fragmentShader={DappledShader.fragmentShader}
      />
    </mesh>
  );
}

interface DappledLightProps {
  position: [number, number, number];
  targetT: number;
  scrollProgress: number;
  onActiveChange?: (active: boolean) => void;
}

export default function DappledLightPlant({ position, targetT, scrollProgress, onActiveChange }: DappledLightProps) {
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
    const breatheScale = 1.0 + Math.sin(time * 0.35) * 0.02;
    const breatheRotate = Math.sin(time * 0.35) * 0.015;

    const targetScale = isNear ? 1.25 : 0.8;
    const currentScale = groupRef.current.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, targetScale * breatheScale, 0.08);
    groupRef.current.scale.set(nextScale, nextScale, nextScale);

    // Subtle sway
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, breatheRotate, 0.05);
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 3D Dapple Sphere mesh */}
      <DappleSphere />

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
          ✦ Dappled Leaf Shadows
        </motion.div>
      </Html>
    </group>
  );
}
