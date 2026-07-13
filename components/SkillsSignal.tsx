'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStationContext } from '@/app/providers';
import { stations } from '@/lib/stations';

// Mapping of project/scene IDs to relevant skills to highlight
const stationSkillsMap: Record<string, string[]> = {
  'about': [
    'TypeScript', 'React', 'Next.js', 'Node.js', 'Three.js', 'WebGL', 'GLSL',
    'Tailwind CSS', 'Framer Motion', 'PostgreSQL', 'Redis', 'Docker', 'AWS',
    'GraphQL', 'Rust', 'Python'
  ],
  'demo-spring': ['Framer Motion', 'TypeScript', 'React'],
  'demo-shaders': ['WebGL', 'GLSL', 'Three.js'],
  'demo-micro': ['React', 'Framer Motion', 'TypeScript'],
  'demo-kinetic': ['TypeScript', 'React'],
  'demo-scroll': ['Framer Motion', 'Next.js', 'React'],
  'demo-particles': ['TypeScript', 'React'],
  'demo-3d': ['Three.js', 'WebGL', 'React'],
};

export default function SkillsSignal() {
  const { activeStationId } = useStationContext();

  const aboutStation = stations.find((s) => s.type === 'about');
  const allSkills = aboutStation?.skills ?? [];

  const activeSkills = useMemo(() => {
    if (!activeStationId) return [];
    return stationSkillsMap[activeStationId] ?? [];
  }, [activeStationId]);

  return (
    <div
      style={{
        position: 'fixed',
        left: '2.5rem',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 40,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '0.45rem',
        maxWidth: '160px',
      }}
      className="hidden md:flex"
    >
      {allSkills.map((skill) => {
        const isHighlighted = activeSkills.includes(skill);

        return (
          <motion.span
            key={skill}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              letterSpacing: '0.12em',
              color: isHighlighted ? 'var(--accent)' : 'var(--text-dim)',
              whiteSpace: 'nowrap',
              textShadow: isHighlighted ? '0 0 10px rgba(94, 234, 212, 0.3)' : 'none',
              transition: 'color 0.4s ease, text-shadow 0.4s ease',
            }}
            animate={{
              opacity: isHighlighted ? [0.8, 1, 0.8] : 0.25,
            }}
            transition={
              isHighlighted
                ? {
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
                : { duration: 0.3 }
            }
          >
            {isHighlighted ? '✦' : '◇'} {skill}
          </motion.span>
        );
      })}
    </div>
  );
}
