'use client';

import { useState, useEffect } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const [, setScrollPct] = useState(0);

  // Smooth spring for the progress bar
  const smoothProgress = useSpring(0, {
    stiffness: 60,
    damping: 20,
    mass: 0.5,
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      setScrollPct(pct);
      smoothProgress.set(pct);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [smoothProgress]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: 2,
        height: '100vh',
        zIndex: 200,
        pointerEvents: 'none',
      }}
    >
      {/* Track */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--border-subtle)',
          opacity: 0.3,
        }}
      />
      {/* Fill */}
      <motion.div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          scaleY: smoothProgress,
          transformOrigin: 'top center',
          background: 'var(--accent)',
          boxShadow: '0 0 8px var(--accent-glow)',
          opacity: 0.5,
        }}
      />
    </motion.div>
  );
}
