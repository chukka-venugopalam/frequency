'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ─── Interactive distortion shader ─── */

const DistortionShader = {
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

      // Distance from mouse cursor
      float dist = distance(uv, mouse);

      // Ripple displacement
      float ripple = sin(dist * 25.0 - uTime * 2.5) * 0.025 / (dist * 1.5 + 0.5);
      vec2 distortedUv = uv + (uv - mouse) * ripple;

      // Color field — premium muted teal tones
      float r = 0.05 * (0.5 + 0.5 * sin(distortedUv.x * 3.0 + uTime * 0.4));
      float g = 0.72 * (0.5 + 0.5 * sin(distortedUv.y * 3.0 + uTime * 0.3));
      float b = 0.65 * (0.5 + 0.5 * sin((distortedUv.x + distortedUv.y) * 2.5 + uTime * 0.2));

      // Cursor glow
      float glow = 0.12 / (dist * 2.5 + 0.3);
      g += glow * 0.25;
      b += glow * 0.25;

      // Grid lines for structure
      float gridX = step(0.96, fract(distortedUv.x * 10.0));
      float gridY = step(0.96, fract(distortedUv.y * 10.0));
      float grid = max(gridX, gridY) * 0.08;
      g += grid;
      b += grid;

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
        vertexShader={DistortionShader.vertexShader}
        fragmentShader={DistortionShader.fragmentShader}
      />
    </mesh>
  );
}

export default function ShaderDemo() {
  return (
    <div
      style={{
        width: '100%',
        height: 300,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1, near: 0.1, far: 10 }}
        gl={{ antialias: false, alpha: false }}
        style={{ width: '100%', height: '100%' }}
      >
        <ShaderQuad />
      </Canvas>
    </div>
  );
}
