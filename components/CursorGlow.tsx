'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CursorGlow() {
  const [isVisible, setIsVisible] = useState(false);
  const [isTouch] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : true
  );
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Softer spring: low-stiffness, high-damping for calm drag trailing
  const springConfig = { stiffness: 60, damping: 30, mass: 0.8 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    if (isTouch) return;

    const moveMouse = (e: MouseEvent) => {
      // Center the 160px halo on the cursor
      mouseX.set(e.clientX - 80);
      mouseY.set(e.clientY - 80);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', moveMouse);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', moveMouse);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [mouseX, mouseY, isVisible, isTouch]);

  if (isTouch || !isVisible) return null;

  return (
    <motion.div
      style={{
        position: 'fixed',
        left: cursorX,
        top: cursorY,
        width: 160,
        height: 160,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(234, 179, 8, 0.06) 0%, rgba(234, 179, 8, 0.01) 50%, transparent 70%)',
        zIndex: 9999,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }}
    />
  );
}
