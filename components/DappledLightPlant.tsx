'use client';

import { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Html } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Custom Dappled Light Shader ───
const DappleShader = {
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
    uniform float uTime;
    uniform vec2 uMouse;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      // Shifting leaf coordinates driven by time and cursor
      vec2 coord = vUv * 5.0;
      vec2 shift = vec2(sin(uTime * 0.4), cos(uTime * 0.3)) * 0.3 + uMouse * 0.5;
      
      // Layered sine wave coordinates for organic leaf shapes
      float val = sin(coord.x + shift.x) * cos(coord.y + shift.y);
      val += sin(coord.x * 2.1 - shift.y) * cos(coord.y * 1.8 + shift.x) * 0.5;
      val += sin(coord.x * 0.8 + uTime * 0.1) * 0.3;

      // Soft thresholding to draw shadows
      float dapple = smoothstep(-0.25, 0.45, val);

      // Warm ivory base and dark garden green shadow colors
      vec3 baseColor = vec3(0.96, 0.92, 0.88);
      vec3 shadowColor = vec3(0.04, 0.12, 0.08);

      // Simple Lambertian shading from top-right light source
      vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
      float diff = max(0.2, dot(vNormal, lightDir));

      // Compose final pixel color
      vec3 litColor = baseColor * diff;
      vec3 finalColor = mix(litColor, shadowColor * diff, dapple * 0.7);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `,
};

function DappleSphere() {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { pointer } = useThree();

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
  }), []);

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      // Smoothly lerp mouse position to prevent sudden shadow shifts
      materialRef.current.uniforms.uMouse.value.lerp(pointer, 0.08);
    }
  });

  return (
    <mesh>
      <sphereGeometry args={[0.9, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        attach="material"
        uniforms={uniforms}
        vertexShader={DappleShader.vertexShader}
        fragmentShader={DappleShader.fragmentShader}
      />
    </mesh>
  );
}

interface DappledLightProps {
  position: [number, number, number];
  targetT: number;
  scrollProgress: number;
}

export default function DappledLightPlant({ position, targetT, scrollProgress }: DappledLightProps) {
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
        {/* Stone / Egg container */}
        <motion.div
          style={{
            width: 90,
            height: 90,
            borderRadius: '60% 40% 60% 40% / 50% 50% 50% 50%', // Organic pebble/egg shape
            overflow: 'hidden',
            background: 'rgba(5, 12, 8, 0.4)',
            border: isNear
              ? '1px solid hsl(268, 70%, 80%)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: isNear
              ? '0 0 22px rgba(167, 139, 250, 0.25)'
              : '0 0 8px rgba(0, 0, 0, 0.4)',
            pointerEvents: 'auto',
            cursor: 'crosshair',
          }}
          animate={
            isNear
              ? {
                  scale: [1, 1.04, 1],
                  rotate: [0, -1, 1, 0],
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
            camera={{ position: [0, 0, 2.2], fov: 50 }}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
              pointerEvents: 'none',
            }}
          >
            <DappleSphere />
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
            DAPPLED SUNLIGHT
          </h4>
          <p style={{ margin: 0, fontSize: '0.7rem', lineHeight: 1.4, color: '#8e9c93' }}>
            Atmospheric shading projecting dynamic foliage shadow masks onto 3D surfaces. Procedural leaf coordinates shift with constant time wind and respond to mouse coordinates. Best used for immersive hero sections and brand scenes.
          </p>
        </motion.div>
      </div>
    </Html>
  );
}
