'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function SpringPhysicsDemo() {
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div
      ref={constraintsRef}
      style={{
        width: '100%',
        height: 300,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: 12,
        background: 'rgba(255, 255, 255, 0.01)',
      }}
    >
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.8}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        style={{
          width: 120,
          height: 120,
          borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(94, 234, 212, 0.15), rgba(94, 234, 212, 0.03))',
          border: '1px solid rgba(94, 234, 212, 0.35)',
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
          boxShadow: isDragging ? '0 0 30px rgba(94, 234, 212, 0.15)' : '0 0 10px rgba(94, 234, 212, 0.03)',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95, cursor: 'grabbing' }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 25,
          mass: 1,
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
        }}
      >
        Fling &middot; Drag &middot; Release
      </div>
    </div>
  );
}
