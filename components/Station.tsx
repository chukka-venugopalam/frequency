'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { StationData } from '@/lib/stations';
import { useStationContext } from '@/app/providers';
import SpringPhysicsDemo from '@/components/demos/SpringPhysicsDemo';
import ShaderDemo from '@/components/demos/ShaderDemo';
import MicroInteractionsDemo from '@/components/demos/MicroInteractionsDemo';
import KineticTypeDemo from '@/components/demos/KineticTypeDemo';
import ScrollChoreographyDemo from '@/components/demos/ScrollChoreographyDemo';
import ParticlesDemo from '@/components/demos/ParticlesDemo';
import ThreeDDemo from '@/components/demos/ThreeDDemo';

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
  ThreeDDemo,
};

export default function Station({ station }: StationProps) {
  const { setActiveStationId } = useStationContext();
  const sectionRef = useRef<HTMLDivElement>(null);

  // Set up viewport-relative scroll tracking for this section
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Map progress (0 = enters viewport bottom, 0.5 = centered, 1 = leaves viewport top)
  // to opacity, blur, and vertical translation (drift)
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [80, 0, 0, -80]);
  const blurValue = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [16, 0, 0, 16]);
  
  // Custom transform style for blur
  const filter = useTransform(blurValue, (b) => `blur(${b}px)`);

  const DemoComponent = station.demoComponent
    ? demoComponentMap[station.demoComponent]
    : null;

  return (
    <section
      ref={sectionRef}
      className="frequency-section"
      id={`station-${station.id}`}
      style={{ overflow: 'hidden' }}
    >
      <motion.div
        onViewportEnter={() => setActiveStationId(station.id)}
        viewport={{ margin: '-30% 0px -30% 0px' }} // Sticky reveal zone
        className="project-container"
        style={{
          opacity,
          y,
          filter,
        }}
      >
        {/* Header */}
        <div className="project-header">
          <div className="signal-meta">
            <span className="dot" />
            <span>{station.subtitle}</span>
          </div>
          <h2 className="project-title">{station.name}</h2>
        </div>

        {/* Live Demo Component Wrapper */}
        {DemoComponent && (
          <motion.div
            className="demo-container"
            style={{ width: '100%', minHeight: 280 }}
            animate={{
              y: [0, -4, 0],
              scale: [0.99, 1.01, 0.99]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <DemoComponent />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
