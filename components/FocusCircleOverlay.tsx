'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Import exported subcomponents from original plant files
import { InteractiveSeedPodMesh } from './SpringPhysicsSeedPod';
import { ShaderQuad } from './DewLeafPlant';
import { CrystalSeed, DividingCapsule, OrbitingSpore } from './BuddingSeedClusterPlant';
import { VineMesh } from './GrowingVinePlant';
import { DappleSphere } from './DappledLightPlant';

interface FocusCircleOverlayProps {
  activePlant: number | null;
}

const focusDetails = [
  {
    name: 'Spring Physics Simulation',
    technique: 'Interactive Elastic Mesh Math',
    description: 'Real-time Euler integration simulating mass displacement, spring tension, and friction velocity damping. The 3D pod mesh captures and tracks pointer coordinates, returning to its rest state with natural elastic momentum when released.',
    useCase: 'Highly responsive UI gestures, rubber-band menus, tactile slider knobs, and organic page transition handles.',
  },
  {
    name: 'GLSL GPU Fluid Ripples',
    technique: 'Interactive Fragment Shading',
    description: 'High-performance fragment shader calculating real-time fluid wave propagation directly on the GPU. Computes distance-field mouse offsets to dynamically distort texture coordinates, creating smooth pool ripples.',
    useCase: 'Interactive hero backdrops, premium creative branding spots, and immersive mouse-trail liquid distortions.',
  },
  {
    name: 'Brownian-Motion Particles',
    technique: 'HTML5 Canvas Generative Spores',
    description: 'Continuous random walk physics driving a dense field of floating spores. Spores calculate distance vectors to the cursor position and steer dynamically to cluster around hover points.',
    useCase: 'Quiet ambient website backgrounds, particle trailing feedback systems, and interactive canvas screens.',
  },
  {
    name: '3D Crystal Cluster & Fracture',
    technique: 'Volumetric Geometry Division',
    description: 'Volumetric multi-object WebGL scene showcasing complex crystal structures. The division capsules split along fracture lines and reassemble on a continuous time loop, reacting with emissive intensity on hover.',
    useCase: '3D product exploration viewports, abstract architectural elements, and volumetric data dashboards.',
  },
  {
    name: 'Spline Tube Growth Extrusion',
    technique: 'Procedural Spline Extrusion',
    description: 'Procedurally extruded 3D tube geometry calculated along a Catmull-Rom spline path. Growth progress is controlled by a vertex shader discard map, progressively scaling leaf nodes as the frontier expands.',
    useCase: 'Animated roadmap indicators, organic loading meters, and interactive visual progression paths.',
  },
  {
    name: 'Dappled Foliage Shading',
    technique: 'Procedural Shadow Mask Projection',
    description: 'Atmospheric GPU shader simulating light filtering through tree leaves. A layered sine wave coordinates mask shifts with time and mouse coordinates to cast organic shadows onto a 3D Lambertian sphere.',
    useCase: 'Rich background ambient light setups, high-fidelity mockups, and moody product showcase scenes.',
  },
  {
    name: 'Volumetric Waypoint Glow',
    technique: 'Emissive Material Animation',
    description: 'Breathes emissive light energy to highlight the end of the garden path. Volumetric values (metalness, roughness, and glow intensity) animate dynamically to reflect target proximity.',
    useCase: 'Spatial landmarks, 3D waypoint buttons, and key interactive hotspots in 3D walkthroughs.',
  },
];

// ─── Animation Viewport Wrappers ───

function SpringPhysicsFocus() {
  const [isDragging, setIsDragging] = useState(false);
  return (
    <Canvas camera={{ position: [0, 0, 3.5], fov: 50 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.7} color="#0f291e" />
      <pointLight position={[5, 5, 5]} intensity={1.8} color="#fbbf24" />
      <pointLight position={[-5, -5, 5]} intensity={0.9} color="#c084fc" />
      <InteractiveSeedPodMesh
        isNear={true}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
      />
    </Canvas>
  );
}

function ShaderFocus() {
  return (
    <Canvas
      orthographic
      camera={{ position: [0, 0, 1], zoom: 1, near: 0.1, far: 10 }}
      gl={{ antialias: false, alpha: false }}
      style={{ width: '100%', height: '100%' }}
    >
      <ShaderQuad />
    </Canvas>
  );
}

interface FocusParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

function PollenFocusCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<FocusParticle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = 360;
    const h = 360;
    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const count = 75;
    const p = [];
    for (let i = 0; i < count; i++) {
      p.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        size: 1.4 + Math.random() * 2.2,
        alpha: 0.35 + Math.random() * 0.5,
      });
    }
    particlesRef.current = p;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      particles.forEach((pt) => {
        const dx = mouse.x - pt.x;
        const dy = mouse.y - pt.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 90 && dist > 1) {
          const force = ((90 - dist) / 90) * 0.08;
          pt.vx += (dx / dist) * force;
          pt.vy += (dy / dist) * force;
        }

        pt.vx += (Math.random() - 0.5) * 0.04;
        pt.vy += (Math.random() - 0.5) * 0.04;
        pt.vx *= 0.95;
        pt.vy *= 0.95;

        pt.x += pt.vx;
        pt.y += pt.vy;

        if (pt.x < -5) pt.x = w + 5;
        if (pt.x > w + 5) pt.x = -5;
        if (pt.y < -5) pt.y = h + 5;
        if (pt.y > h + 5) pt.y = -5;

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${pt.alpha})`;
        ctx.fill();
      });

      // Connections
      ctx.strokeStyle = 'rgba(251, 191, 36, 0.12)';
      ctx.lineWidth = 0.55;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = dx * dx + dy * dy;
          if (dist < 1800) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        cursor: 'crosshair',
      }}
    />
  );
}

function ClusterFocus() {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 60 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#fbbf24" />
      <pointLight position={[-5, -5, 5]} intensity={0.8} color="#c084fc" />
      <CrystalSeed />
      <DividingCapsule />
      <OrbitingSpore />
    </Canvas>
  );
}

function VineFocus() {
  return (
    <Canvas camera={{ position: [0, 0, 3.2], fov: 50 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={1.8} color="#fbbf24" />
      <VineMesh isNear={true} />
    </Canvas>
  );
}

function DappleFocus() {
  return (
    <Canvas camera={{ position: [0, 0, 2.2], fov: 50 }} style={{ width: '100%', height: '100%' }}>
      <DappleSphere />
    </Canvas>
  );
}

function FocusSphere() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.4;
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      const scale = 1.0 + Math.sin(state.clock.elapsedTime * 1.8) * 0.04;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.9, 32, 32]} />
      <meshStandardMaterial
        color="#fbbf24"
        emissive="#fbbf24"
        emissiveIntensity={1.4}
        roughness={0.15}
        metalness={0.9}
      />
    </mesh>
  );
}

function GlowFocus() {
  return (
    <Canvas camera={{ position: [0, 0, 2.2], fov: 50 }} style={{ width: '100%', height: '100%' }}>
      <ambientLight intensity={0.6} color="#0f291e" />
      <pointLight position={[3, 3, 3]} intensity={1.8} color="#fbbf24" />
      <FocusSphere />
    </Canvas>
  );
}

// ─── Main Overlay Component ───

export default function FocusCircleOverlay({ activePlant }: FocusCircleOverlayProps) {
  const renderFocusAnimation = (idx: number) => {
    switch (idx) {
      case 0:
        return <SpringPhysicsFocus />;
      case 1:
        return <ShaderFocus />;
      case 2:
        return <PollenFocusCanvas />;
      case 3:
        return <ClusterFocus />;
      case 4:
        return <VineFocus />;
      case 5:
        return <DappleFocus />;
      case 6:
        return <GlowFocus />;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence mode="wait">
        {activePlant !== null && activePlant >= 0 && activePlant < focusDetails.length && (
          <div
            key={activePlant}
            style={{
              width: '100%',
              maxWidth: 1200,
              padding: '0 4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pointerEvents: 'none',
            }}
          >
            {/* Left side: Large Spotlight Focus Circle */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.7, rotate: 10 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: 360,
                height: 360,
                borderRadius: '50%',
                border: '2.5px solid var(--accent)',
                boxShadow: '0 0 45px rgba(251, 191, 36, 0.25), inset 0 0 30px rgba(5, 12, 8, 0.9)',
                overflow: 'hidden',
                background: '#050c08',
                pointerEvents: 'auto',
                position: 'relative',
              }}
            >
              {renderFocusAnimation(activePlant)}
            </motion.div>

            {/* Right side: Elegant details card */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
              style={{
                width: 410,
                padding: '2.2rem',
                background: 'rgba(5, 12, 8, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
                pointerEvents: 'auto',
                textAlign: 'left',
              }}
            >
              {/* Technique tag */}
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'var(--accent)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  marginBottom: '0.5rem',
                }}
              >
                {focusDetails[activePlant].technique}
              </div>

              {/* Title */}
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.9rem',
                  fontWeight: 400,
                  color: '#ffffff',
                  margin: '0 0 1.2rem 0',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                }}
              >
                {focusDetails[activePlant].name}
              </h2>

              {/* Description */}
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.82rem',
                  lineHeight: 1.6,
                  color: 'var(--text-secondary)',
                  margin: '0 0 1.5rem 0',
                }}
              >
                {focusDetails[activePlant].description}
              </p>

              {/* Divider */}
              <div
                style={{
                  height: '1px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  margin: '0 0 1.3rem 0',
                }}
              />

              {/* Use Case */}
              <div>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.62rem',
                    color: 'var(--text-dim)',
                    letterSpacing: '0.1em',
                    marginBottom: '0.35rem',
                  }}
                >
                  CLIENT USE CASE
                </div>
                <p
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                    color: '#ffffff',
                    fontWeight: 300,
                    margin: 0,
                  }}
                >
                  {focusDetails[activePlant].useCase}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
