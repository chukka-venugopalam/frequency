'use client';

import { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Html } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Custom Growth Shader Material ───
const VineShader = {
  uniforms: {
    uGrowth: { value: 0 },
    uColor: { value: new THREE.Color('#fbbf24') }, // Warm golden vine
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uGrowth;
    uniform vec3 uColor;
    varying vec2 vUv;
    void main() {
      if (vUv.x > uGrowth) {
        discard;
      }
      // Soft organic tube shading
      float intensity = 0.3 + 0.7 * sin(vUv.y * 3.14159);
      gl_FragColor = vec4(uColor * intensity, 1.0);
    }
  `,
};

function VineMesh({ isNear }: { isNear: boolean }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const growthRef = useRef(0);

  // Define leaves along the vine
  const leafNodes = useMemo(() => [
    { t: 0.25, pos: new THREE.Vector3(), ref: { current: null as THREE.Mesh | null } },
    { t: 0.50, pos: new THREE.Vector3(), ref: { current: null as THREE.Mesh | null } },
    { t: 0.75, pos: new THREE.Vector3(), ref: { current: null as THREE.Mesh | null } },
    { t: 0.95, pos: new THREE.Vector3(), ref: { current: null as THREE.Mesh | null } },
  ], []);

  // Curve geometry
  const { geometry } = useMemo(() => {
    const points = [
      new THREE.Vector3(0, -1.2, 0),
      new THREE.Vector3(0.4, -0.6, 0.2),
      new THREE.Vector3(-0.3, 0.0, -0.1),
      new THREE.Vector3(0.5, 0.6, 0.3),
      new THREE.Vector3(-0.2, 1.2, 0),
    ];
    const c = new THREE.CatmullRomCurve3(points);
    const geom = new THREE.TubeGeometry(c, 64, 0.06, 8, false);

    // Compute coordinates of leaf attachment points
    leafNodes.forEach((node) => {
      node.pos.copy(c.getPointAt(node.t));
    });

    return { geometry: geom };
  }, [leafNodes]);

  const uniforms = useMemo(() => ({
    uGrowth: { value: 0 },
    uColor: { value: new THREE.Color('#fbbf24') },
  }), []);

  useFrame((state, delta) => {
    // Animate growth progress (1.5 seconds reveal)
    const target = isNear ? 1.0 : 0.0;
    const speed = 0.8 * delta; // Adjust speed based on frame delta
    
    if (growthRef.current < target) {
      growthRef.current = Math.min(target, growthRef.current + speed);
    } else if (growthRef.current > target) {
      growthRef.current = Math.max(target, growthRef.current - speed * 1.5);
    }

    if (materialRef.current) {
      materialRef.current.uniforms.uGrowth.value = growthRef.current;
    }

    // Scale leaves based on local vine growth
    leafNodes.forEach((node) => {
      if (node.ref.current) {
        const leafGrowth = Math.max(0, Math.min(1, (growthRef.current - node.t) * 8));
        node.ref.current.scale.set(leafGrowth, leafGrowth, leafGrowth);
      }
    });
  });

  return (
    <group>
      {/* The Vine Tube */}
      <mesh geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          attach="material"
          uniforms={uniforms}
          vertexShader={VineShader.vertexShader}
          fragmentShader={VineShader.fragmentShader}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Leaf Nodes */}
      {leafNodes.map((node, index) => (
        <mesh
          key={index}
          ref={node.ref as React.RefObject<THREE.Mesh>}
          position={node.pos}
        >
          <sphereGeometry args={[0.15, 12, 12]} />
          <meshStandardMaterial
            color="#c084fc" // Secondary floral accent (lavender)
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

interface GrowingVineProps {
  position: [number, number, number];
  targetT: number;
  scrollProgress: number;
}

export default function GrowingVinePlant({ position, targetT, scrollProgress }: GrowingVineProps) {
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
        {/* Vine Container */}
        <motion.div
          style={{
            width: 100,
            height: 100,
            borderRadius: '15% 15% 85% 85% / 20% 20% 80% 80%', // Hanging pot shape
            overflow: 'hidden',
            background: 'rgba(5, 12, 8, 0.4)',
            border: isNear
              ? '1px solid hsl(268, 70%, 80%)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: isNear
              ? '0 0 22px rgba(167, 139, 250, 0.25)'
              : '0 0 8px rgba(0, 0, 0, 0.4)',
            pointerEvents: 'auto',
          }}
          animate={
            isNear
              ? {
                  scale: [1, 1.04, 1],
                  rotate: [0, 1, -1, 0],
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
              : { type: 'spring', stiffness: 95, damping: 20 }
          }
        >
          <Canvas
            camera={{ position: [0, 0, 3.2], fov: 50 }}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          >
            <ambientLight intensity={0.4} />
            <pointLight position={[3, 3, 3]} intensity={1.5} color="#fbbf24" />
            <VineMesh isNear={isNear} />
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
            PROCEDURAL VINE
          </h4>
          <p style={{ margin: 0, fontSize: '0.7rem', lineHeight: 1.4, color: '#8e9c93' }}>
            Procedural vine path reveal utilizing shader geometry clipping. Extrudes a 3D tube spline while progressively scaling leaf nodes as the growth frontier advances. Ideal for interactive timelines and organic loading indicators.
          </p>
        </motion.div>
      </div>
    </Html>
  );
}
