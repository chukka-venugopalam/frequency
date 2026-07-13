'use client';

import { useRef, useEffect, useState } from 'react';

const LETTERS = 'KINETIC'.split('');

export default function KineticTypeDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setMousePos({
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      });
    };
    const handleLeave = () => setMousePos({ x: 0.5, y: 0.5 });
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: 280,
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 12,
        background: 'rgba(255, 255, 255, 0.01)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'crosshair',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '0.15em',
          letterSpacing: '0.1em',
        }}
      >
        {LETTERS.map((letter, i) => {
          const letterPos = (i + 0.5) / LETTERS.length;
          const distFromMouse = Math.abs(mousePos.x - letterPos);
          const influence = Math.max(0, 1 - distFromMouse * 4);
          const scale = 1 + influence * 0.8;
          const weight = 300 + influence * 500;

          return (
            <span
              key={i}
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: `${3 + influence * 1.5}rem`,
                fontWeight: Math.round(weight),
                color: influence > 0.3 ? 'var(--accent)' : 'var(--text-secondary)',
                display: 'inline-block',
                transform: `scaleY(${scale})`,
                transition: 'color 0.2s ease, text-shadow 0.2s ease',
                lineHeight: 1,
                letterSpacing: influence > 0.3 ? '0.05em' : '0.1em',
                textShadow: influence > 0.5
                  ? `0 0 ${influence * 16}px rgba(94, 234, 212, 0.25)`
                  : 'none',
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: 12,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.55rem',
          color: 'var(--text-dim)',
          letterSpacing: '0.1em',
          opacity: 0.5,
        }}
      >
        Move cursor across letters
      </div>
    </div>
  );
}
