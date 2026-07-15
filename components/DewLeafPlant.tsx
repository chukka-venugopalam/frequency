'use client';

import { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Html } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
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

function ShaderQuad() {
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
      <planeGeometry args={[2, 2]} />
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
}

export default function DewLeafPlant({ position, targetT, scrollProgress }: DewLeafProps) {
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
        {/* Leaf / Water pool shape wrapper */}
        <motion.div
          style={{
            width: 90,
            height: 90,
            borderRadius: '10% 80% 10% 80%', // Organic dew leaf / pool shape
            overflow: 'hidden',
            background: 'rgba(5, 12, 8, 0.4)',
            border: isNear
              ? '1px solid hsl(268, 70%, 80%)' // Lavender bloom highlights
              : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: isNear
              ? '0 0 20px rgba(167, 139, 250, 0.25)' // Lavender glow
              : '0 0 8px rgba(0, 0, 0, 0.4)',
            pointerEvents: 'auto', // Enable pointer events for mouse hover ripples
            cursor: 'crosshair',
          }}
          animate={
            isNear
              ? {
                  scale: [1, 1.03, 1],
                  rotate: [0, -1, 1, 0],
                }
              : { scale: 0.85 }
          }
          transition={
            isNear
              ? {
                  scale: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { duration: 9, repeat: Infinity, ease: 'easeInOut' },
                  type: 'spring',
                  stiffness: 100,
                  damping: 15,
                }
              : { type: 'spring', stiffness: 80, damping: 20 }
          }
        >
          {/* Inner WebGL Water distortion */}
          <Canvas
            orthographic
            camera={{ position: [0, 0, 1], zoom: 1, near: 0.1, far: 10 }}
            gl={{ antialias: false, alpha: false }}
            style={{
              width: '100%',
              height: '100%',
              pointerEvents: 'none', // Allow parent container to handle pointer events
            }}
          >
            <ShaderQuad />
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
            GLSL SHADER POOL
          </h4>
          <p style={{ margin: 0, fontSize: '0.7rem', lineHeight: 1.4, color: '#8e9c93' }}>
            Dynamic GLSL shader distortion simulating rippling organic fluids. Computes ripple vectors on the GPU in real time as the cursor moves. Suited for interactive landing hero backdrops.
          </p>
        </motion.div>
      </div>
    </Html>
  );
}
