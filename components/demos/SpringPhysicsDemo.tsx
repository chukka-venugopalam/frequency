'use client';

import { useRef, useState } from 'react';
import { motion, type PanInfo } from 'framer-motion';

interface TrailDot {
  x: number;
  y: number;
  key: number;
}

export default function SpringPhysicsDemo() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [trail, setTrail] = useState<TrailDot[]>([]);
  const trailRef = useRef<TrailDot[]>([]);
  const keyRef = useRef(0);
  const lastPushRef = useRef(0);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDragStart = () => {
    setIsDragging(true);
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    // Reset trail on new drag
    trailRef.current = [];
    setTrail([]);
  };

  const handleDrag = (_: unknown, info: PanInfo) => {
    // Throttle to ~60fps
    const now = Date.now();
    if (now - lastPushRef.current < 16) return;
    lastPushRef.current = now;

    if (!constraintsRef.current) return;
    const rect = constraintsRef.current.getBoundingClientRect();
    const x = rect.width / 2 + info.offset.x;
    const y = rect.height / 2 + info.offset.y;

    const newDot: TrailDot = { x, y, key: keyRef.current++ };
    const updated = [...trailRef.current.slice(-5), newDot];
    trailRef.current = updated;
    setTrail(updated);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // Fade out trail after a brief delay
    fadeTimerRef.current = setTimeout(() => {
      setTrail([]);
      trailRef.current = [];
    }, 400);
  };

  return (
    <div
      ref={constraintsRef}
      style={{
        width: '100%',
        height: 300,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(94, 234, 212, 0.08)',
        borderRadius: 4,
        background: 'rgba(0,0,0,0.2)',
      }}
    >
      {/* Drag Trail render */}
      {trail.map((dot, i) => {
        const progress = i / Math.max(trail.length - 1, 1); // 0 = oldest, 1 = newest
        return (
          <motion.div
            key={dot.key}
            initial={{ opacity: 0.25 * (1 - progress * 0.5), scale: 0.7 + progress * 0.3 }}
            animate={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: 120,
              height: 120,
              borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(94, 234, 212, 0.1), rgba(94, 234, 212, 0.01))',
              border: '1px solid rgba(94, 234, 212, 0.15)',
              left: dot.x - 60,
              top: dot.y - 60,
              zIndex: 0,
              pointerEvents: 'none',
              boxShadow: `0 0 ${10 + progress * 20}px rgba(94, 234, 212, ${0.03 + progress * 0.04})`,
            }}
          />
        );
      })}

      {/* Main draggable card */}
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.7}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{
          width: 120,
          height: 120,
          borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(94, 234, 212, 0.2), rgba(94, 234, 212, 0.03))',
          border: '1px solid rgba(94, 234, 212, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: -60,
          marginLeft: -60,
          fontSize: '0.65rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--accent)',
          letterSpacing: '0.1em',
          userSelect: 'none',
          zIndex: 1,
          boxShadow: isDragging
            ? '0 0 30px rgba(94, 234, 212, 0.15)'
            : '0 0 10px rgba(94, 234, 212, 0.03)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95, cursor: 'grabbing' }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 25,
          mass: 1.2,
        }}
      >
        {isDragging ? 'RELEASE' : 'DRAG ME'}
      </motion.div>

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
        Fling &middot; Drag &middot; Release
      </div>
    </div>
  );
}
