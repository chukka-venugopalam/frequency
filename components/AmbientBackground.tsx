'use client';

import { useEffect, useRef } from 'react';
import { useThemeContext } from '@/app/providers';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  phase: number;
  speed: number;
  color: string; // RGB values "R, G, B" for particle color
}

export default function AmbientBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useThemeContext();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let particles: Particle[] = [];
    const particleCount = 28;

    const initParticles = (width: number, height: number) => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        const baseAlpha = 0.08 + Math.random() * 0.12;
        
        // Dynamic color assignment based on theme context
        let color = '251, 191, 36'; // Dark (default gold)
        if (theme === 'light') {
          // fresh emerald green or soft teal
          color = Math.random() > 0.4 ? '16, 185, 129' : '20, 184, 166';
        } else if (theme === 'mixed') {
          // twilight lavender or glowing cyan
          color = Math.random() > 0.4 ? '167, 139, 250' : '34, 211, 238';
        } else {
          // gold or moss green
          color = Math.random() > 0.4 ? '251, 191, 36' : '74, 222, 128';
        }

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          // extremely slow drift speeds
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          size: 1.5 + Math.random() * 2.5,
          alpha: baseAlpha,
          baseAlpha,
          phase: Math.random() * Math.PI * 2,
          speed: 0.0005 + Math.random() * 0.001,
          color,
        });
      }
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      initParticles(width, height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    let time = 0;

    const animate = () => {
      time += 0.002;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Clear the canvas
      ctx.clearRect(0, 0, w, h);

      // Shifting background gradient coordinates
      if (containerRef.current) {
        const glowX = 50 + Math.sin(time * 0.5) * 15;
        const glowY = 50 + Math.cos(time * 0.4) * 15;
        containerRef.current.style.setProperty('--glow-x', `${glowX}%`);
        containerRef.current.style.setProperty('--glow-y', `${glowY}%`);
      }

      // Draw and update each particle
      particles.forEach((p) => {
        // Slow organic sine-wave drift adjustments
        p.phase += p.speed;
        const driftX = Math.sin(p.phase) * 0.08;
        const driftY = Math.cos(p.phase) * 0.08;

        p.x += p.vx + driftX;
        p.y += p.vy + driftY;

        // Soft breathing opacity modulation
        p.alpha = p.baseAlpha + Math.sin(p.phase * 5) * 0.03;

        // Wrap edges smoothly
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // Draw soft glowing particle
        const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
        // Custom color values mapped to individual particle type
        glowGrad.addColorStop(0, `rgba(${p.color}, ${p.alpha})`);
        glowGrad.addColorStop(0.3, `rgba(${p.color}, ${p.alpha * 0.4})`);
        glowGrad.addColorStop(1, `rgba(${p.color}, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();
      });

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  return (
    <div
      ref={containerRef}
      className="ambient-layer"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        background: 'radial-gradient(circle at var(--glow-x, 50%) var(--glow-y, 50%), var(--accent-glow) 0%, var(--bg-base) 55%, transparent 100%)',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
