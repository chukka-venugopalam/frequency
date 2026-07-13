'use client';

import { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
}

export default function ParticlesDemo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef(0);

  const initParticles = useCallback((w: number, h: number) => {
    const count = 120;
    const p: Particle[] = [];
    for (let i = 0; i < count; i++) {
      p.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 1.5 + Math.random() * 2.5,
        alpha: 0.3 + Math.random() * 0.5,
      });
    }
    particlesRef.current = p;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      if (particlesRef.current.length === 0) {
        initParticles(rect.width, rect.height);
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };
    const handleLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    canvas.addEventListener('mousemove', handleMouse);
    canvas.addEventListener('mouseleave', handleLeave);

    const rect = canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      const particles = particlesRef.current;
      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Cursor interaction — attract toward cursor
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 150 && dist > 1) {
          const force = (150 - dist) / 150 * 0.04;
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }

        // Ambient Brownian drift — keeps particles alive even without cursor
        p.vx += (Math.random() - 0.5) * 0.015;
        p.vy += (Math.random() - 0.5) * 0.015;

        // Damping
        p.vx *= 0.98;
        p.vy *= 0.98;

        // Movement
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(94, 234, 212, ${p.alpha})`;
        ctx.fill();
      }

      // Draw faint connections between nearby particles
      ctx.strokeStyle = 'rgba(94, 234, 212, 0.06)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = dx * dx + dy * dy;
          if (dist < 12000) {
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
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouse);
      canvas.removeEventListener('mouseleave', handleLeave);
    };
  }, [initParticles]);

  return (
    <div
      style={{
        width: '100%',
        height: 300,
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'crosshair',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.55rem',
          color: 'var(--text-dim)',
          letterSpacing: '0.1em',
          opacity: 0.5,
          pointerEvents: 'none',
        }}
      >
        Move cursor to attract particles
      </div>
    </div>
  );
}
