'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const BLOCKS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function ScrollChoreographyDemo() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const scrollTop = el.scrollTop;
      const scrollHeight = el.scrollHeight - el.clientHeight;
      setScrollProgress(scrollHeight > 0 ? scrollTop / scrollHeight : 0);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: 300,
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 12,
        background: 'rgba(255, 255, 255, 0.01)',
        overflowY: 'auto',
        position: 'relative',
      }}
    >
      {/* Scroll indicator */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          padding: '8px 12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.55rem',
          color: 'var(--accent)',
          letterSpacing: '0.15em',
          background: 'rgba(3, 3, 3, 0.85)',
          backdropFilter: 'blur(4px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          textAlign: 'center' as const,
        }}
      >
        SCROLL ↓ {Math.round(scrollProgress * 100)}%
      </div>

      {/* Choreography content */}
      <div
        style={{
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        {BLOCKS.map((letter, i) => {
          const entryPoint = i / BLOCKS.length;
          const exitPoint = (i + 1) / BLOCKS.length;
          const localProgress = Math.max(0, Math.min(1,
            (scrollProgress - entryPoint) / (exitPoint - entryPoint + 0.05)
          ));

          // Blocks start scattered, assemble into a grid as you scroll
          const assembleX = localProgress < 0.5
            ? (1 - localProgress * 2) * 120 * (i % 2 === 0 ? 1 : -1)
            : 0;
          const assembleY = localProgress < 0.3
            ? (1 - localProgress * 3.3) * 80
            : 0;
          const opacity = Math.min(1, localProgress * 3);
          const scale = 0.5 + localProgress * 0.5;

          return (
            <motion.div
              key={letter}
              style={{
                width: 64,
                height: 64,
                background: `rgba(94, 234, 212, ${0.05 + localProgress * 0.15})`,
                border: `1px solid rgba(94, 234, 212, ${0.15 + localProgress * 0.25})`,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: '1.2rem',
                color: localProgress > 0.5 ? 'var(--accent)' : 'var(--text-secondary)',
                opacity,
                x: assembleX,
                y: assembleY,
                scale,
              }}
              transition={{ duration: 0.1 }}
            >
              {letter}
            </motion.div>
          );
        })}
      </div>

      <div
        style={{
          padding: 24,
          textAlign: 'center' as const,
          fontFamily: 'var(--font-mono)',
          fontSize: '0.55rem',
          color: 'var(--text-dim)',
          opacity: 0.4,
          letterSpacing: '0.1em',
        }}
      >
        END
      </div>
    </div>
  );
}
