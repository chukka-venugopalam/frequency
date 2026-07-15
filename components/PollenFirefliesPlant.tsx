'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Html } from '@react-three/drei';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

interface PollenProps {
  position: [number, number, number];
  targetT: number;
  scrollProgress: number;
}

export default function PollenFirefliesPlant({ position, targetT, scrollProgress }: PollenProps) {
  const [isNear, setIsNear] = useState(false);
  const [prevScroll, setPrevScroll] = useState(0);
  const diff = Math.abs(scrollProgress - targetT);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef(0);

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

  const initParticles = useCallback((w: number, h: number) => {
    const count = 45;
    const p: Particle[] = [];
    for (let i = 0; i < count; i++) {
      p.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: 1.2 + Math.random() * 2.0,
        alpha: 0.25 + Math.random() * 0.55,
      });
    }
    particlesRef.current = p;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    initParticles(w, h);

    const handleMouseMove = (e: MouseEvent) => {
      const crect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - crect.left,
        y: e.clientY - crect.top,
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

      particles.forEach((p) => {
        // Attract to mouse if cursor is close
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 80 && dist > 1) {
          const force = (80 - dist) / 80 * 0.05;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Ambient jiggle/drift to prevent settling
        p.vx += (Math.random() - 0.5) * 0.03;
        p.vy += (Math.random() - 0.5) * 0.03;

        // Damping
        p.vx *= 0.97;
        p.vy *= 0.97;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
        if (p.y < -5) p.y = h + 5;
        if (p.y > h + 5) p.y = -5;

        // Draw particle - warm gold if bloomed, muted if sleeping
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isNear 
          ? `rgba(251, 191, 36, ${p.alpha})` // Warm Golden pollen
          : `rgba(156, 163, 175, ${p.alpha * 0.4})`; // Sleeping gray fireflies
        ctx.fill();
      });

      // Subtle connections
      if (isNear) {
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.08)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = dx * dx + dy * dy;
            if (dist < 1600) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
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
  }, [initParticles, isNear]);

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
        {/* Organic round cell container */}
        <motion.div
          style={{
            width: 90,
            height: 90,
            borderRadius: '50% 50% 30% 70% / 50% 60% 40% 50%', // Organic cluster bulb
            overflow: 'hidden',
            background: 'rgba(5, 12, 8, 0.55)',
            border: isNear
              ? '1px solid hsl(268, 70%, 80%)' // Lavender bloom highlights
              : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: isNear
              ? '0 0 22px rgba(167, 139, 250, 0.25)' // Lavender glow
              : '0 0 8px rgba(0, 0, 0, 0.4)',
            pointerEvents: 'auto', // Enable pointer events for firefly tracking
            cursor: 'crosshair',
          }}
          animate={
            isNear
              ? {
                  scale: [1, 1.04, 1],
                  rotate: [0, 2, -2, 0],
                }
              : { scale: 0.85 }
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
              : { type: 'spring', stiffness: 90, damping: 20 }
          }
        >
          <canvas
            ref={canvasRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'block',
            }}
          />
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
            POLLEN DUST
          </h4>
          <p style={{ margin: 0, fontSize: '0.7rem', lineHeight: 1.4, color: '#8e9c93' }}>
            Interactive particle field exhibiting continuous Brownian-motion drift. Spores react to cursor movement and swim toward coordinates on hover. Suited for reactive background backdrops and mouse-trail feedback.
          </p>
        </motion.div>
      </div>
    </Html>
  );
}
