'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Html } from '@react-three/drei';

interface SeedPodProps {
  position: [number, number, number];
  targetT: number;
  scrollProgress: number;
}

export default function SpringPhysicsSeedPod({ position, targetT, scrollProgress }: SeedPodProps) {
  const [isNear, setIsNear] = useState(false);
  const [prevScroll, setPrevScroll] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragConstraintsRef = useRef<HTMLDivElement>(null);
  const diff = Math.abs(scrollProgress - targetT);

  // Hysteresis logic
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
      distanceFactor={6} // Scale HTML relative to camera depth
      style={{
        pointerEvents: 'none', // Ensure HTML overlay root doesn't block scroll
      }}
    >
      <div
        ref={dragConstraintsRef}
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
        {/* Organic Bulb Shape Seed Pod */}
        <motion.div
          drag
          dragConstraints={dragConstraintsRef}
          dragElastic={0.8}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          style={{
            width: 70,
            height: 90,
            borderRadius: '40% 40% 50% 50% / 55% 55% 45% 45%', // Bulb/Seed-pod geometry
            background: isNear
              ? 'linear-gradient(135deg, hsl(268, 70%, 75%), hsl(268, 40%, 45%))' // Lavender wake-up
              : 'linear-gradient(135deg, #374151, #1f2937)', // Sleek grey sleep
            border: isDragging
              ? '2px solid var(--accent)' // Golden highlight on active drag
              : isNear
              ? '1px solid hsl(268, 70%, 85%)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: isDragging
              ? '0 0 25px var(--accent)' // Warm golden glow
              : isNear
              ? '0 0 20px rgba(167, 139, 250, 0.35)' // Lavender glow
              : '0 0 8px rgba(0, 0, 0, 0.4)',
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto', // Enable pointer actions on the interactive pod
            position: 'relative',
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
                  stiffness: 120,
                  damping: 12,
                }
              : { type: 'spring', stiffness: 100, damping: 20 }
          }
        >
          {/* Inner core blooming detail */}
          {isNear && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.9 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              style={{
                width: 20,
                height: 30,
                borderRadius: '50%',
                background: 'var(--accent)', // Golden center bulb
                filter: 'blur(3px)',
              }}
            />
          )}

          <div
            style={{
              position: 'absolute',
              bottom: 8,
              fontSize: '0.55rem',
              fontFamily: 'monospace',
              color: isNear ? '#ffffff' : '#9ca3af',
              opacity: 0.65,
              userSelect: 'none',
            }}
          >
            {isDragging ? 'FLING' : 'DRAG'}
          </div>
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
            SPRING PHYSICS
          </h4>
          <p style={{ margin: 0, fontSize: '0.7rem', lineHeight: 1.4, color: '#8e9c93' }}>
            Interactive force bulb using real-time spring physics. Simulates natural weight and momentum on drag release. Ideal for menus, responsive sliders, and tactile card gestures.
          </p>
        </motion.div>
      </div>
    </Html>
  );
}
