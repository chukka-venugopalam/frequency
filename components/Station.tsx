'use client';

import { useRef, useState, useCallback } from 'react';
import {
  motion,
  useScroll,
  useTransform,
} from 'framer-motion';
import type { StationData } from '@/lib/stations';
import { useStationContext } from '@/app/providers';
import SpringPhysicsDemo from '@/components/demos/SpringPhysicsDemo';
import ShaderDemo from '@/components/demos/ShaderDemo';
import MicroInteractionsDemo from '@/components/demos/MicroInteractionsDemo';
import KineticTypeDemo from '@/components/demos/KineticTypeDemo';
import ScrollChoreographyDemo from '@/components/demos/ScrollChoreographyDemo';
import ParticlesDemo from '@/components/demos/ParticlesDemo';

interface StationProps {
  station: StationData;
}

const demoComponentMap: Record<string, React.FC> = {
  SpringPhysicsDemo,
  ShaderDemo,
  MicroInteractionsDemo,
  KineticTypeDemo,
  ScrollChoreographyDemo,
  ParticlesDemo,
};

/* ─── Stagger variants ─── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Station({ station }: StationProps) {
  const { setActiveStationId } = useStationContext();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Set up viewport-relative scroll tracking for this section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Map progress to opacity, blur, and vertical translation (drift)
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [80, 0, 0, -80]);
  const blurValue = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [16, 0, 0, 16]);
  const filter = useTransform(blurValue, (b) => `blur(${b}px)`);

  const DemoComponent = station.demoComponent
    ? demoComponentMap[station.demoComponent]
    : null;

  // ─── Hover depth (3D tilt) ───
  const [tiltStyle, setTiltStyle] = useState({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTiltStyle({
      rotateX: (0.5 - y) * 6,
      rotateY: (x - 0.5) * 6,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTiltStyle({ rotateX: 0, rotateY: 0 });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="frequency-section"
      id={`station-${station.id}`}
      style={{ overflow: 'hidden' }}
    >
      <motion.div
        onViewportEnter={() => setActiveStationId(station.id)}
        viewport={{ margin: '-30% 0px -30% 0px' }}
        className="project-container"
        style={{
          opacity,
          y,
          filter,
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
        >
          {/* Header — subtitle then title stagger */}
          <div className="project-header">
            <motion.div variants={childVariants} className="signal-meta">
              <span className="dot" />
              <span>{station.subtitle}</span>
            </motion.div>
            <motion.h2 variants={childVariants} className="project-title">
              {station.name}
            </motion.h2>
          </div>

          {/* Live Demo Component Wrapper with tilt + breathing */}
          {DemoComponent && (
            <motion.div
              variants={childVariants}
              className="demo-container"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                width: '100%',
                minHeight: 280,
                perspective: 800,
                transformStyle: 'preserve-3d' as const,
              }}
              animate={{
                rotateX: tiltStyle.rotateX,
                rotateY: tiltStyle.rotateY,
                y: [0, -4, 0],
                scale: [0.99, 1.01, 0.99],
              }}
              transition={{
                rotateX: { type: 'spring', stiffness: 200, damping: 25 },
                rotateY: { type: 'spring', stiffness: 200, damping: 25 },
                y: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
                scale: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
              }}
            >
              <DemoComponent />
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
}
