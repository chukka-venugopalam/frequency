'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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

    // Muted teal accent: hsl(174, 60%, 60%) = rgb(0.37, 0.92, 0.83)
    const vec3 TEAL = vec3(0.37, 0.92, 0.83);

    void main() {
      vec2 uv = vUv;
      vec2 mouse = uMouse;

      // Distance from mouse cursor
      float dist = distance(uv, mouse);

      // Ripple displacement
      float ripple = sin(dist * 30.0 - uTime * 3.0) * 0.03 / (dist * 1.5 + 0.5);
      vec2 distortedUv = uv + (uv - mouse) * ripple;

      // Color field — teal tones
      float r = TEAL.r * (0.5 + 0.5 * sin(distortedUv.x * 4.0 + uTime * 0.5));
      float g = TEAL.g * (0.5 + 0.5 * sin(distortedUv.y * 4.0 + uTime * 0.4));
      float b = TEAL.b * (0.5 + 0.5 * sin((distortedUv.x + distortedUv.y) * 3.0 + uTime * 0.3));

      // Cursor glow
      float glow = 0.15 / (dist * 2.0 + 0.3);
      r += glow * 0.3;
      g += glow * 0.3;

      // Grid lines for structure
      float gridX = step(0.95, fract(distortedUv.x * 12.0));
      float gridY = step(0.95, fract(distortedUv.y * 12.0));
      float grid = max(gridX, gridY) * 0.1;
      r += grid;
      g += grid;

      gl_FragColor = vec4(r, g, b, 1.0);
    }
  `,
};

function ShaderQuad() {
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  useFrame((state) => {
    const mat = materialRef.current;
    if (!mat) return;
    // Update uniforms every frame
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    mat.uniforms.uMouse.value.set(
      state.pointer.x * 0.5 + 0.5,
      state.pointer.y * 0.5 + 0.5
    );
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        args={[{
          uniforms: DistortionShader.uniforms,
          vertexShader: DistortionShader.vertexShader,
          fragmentShader: DistortionShader.fragmentShader,
        }]}
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
        borderRadius: 4,
        overflow: 'hidden',
        border: '1px solid rgba(94, 234, 212, 0.06)',
      }}
    >
      <Canvas
        orthographic
        camera={{
          position: [0, 0, 1],
          zoom: 1,
          near: 0.1,
          far: 10,
          left: -1,
          right: 1,
          top: 1,
          bottom: -1,
        }}
        gl={{ antialias: false, alpha: false }}
        style={{ width: '100%', height: '100%' }}
      >
        <ShaderQuad />
      </Canvas>
    </div>
  );
}
