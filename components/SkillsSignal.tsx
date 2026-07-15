'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStationContext } from '@/app/providers';

// Structured skills grouped by domain
const SKILLS_GROUPS = [
  {
    category: 'FRONTEND',
    skills: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Framer Motion'],
  },
  {
    category: '3D & GRAPHICS',
    skills: ['Three.js', 'WebGL', 'GLSL'],
  },
  {
    category: 'BACKEND & SYSTEMS',
    skills: ['Node.js', 'PostgreSQL', 'Redis', 'Docker', 'AWS', 'Rust', 'Python'],
  },
];

// Mapping of project/scene IDs to relevant skills to highlight
const stationSkillsMap: Record<string, string[]> = {
  'about': [
    'TypeScript', 'React', 'Next.js', 'Node.js', 'Three.js', 'WebGL', 'GLSL',
    'Tailwind CSS', 'Framer Motion', 'PostgreSQL', 'Redis', 'Docker', 'AWS',
    'Rust', 'Python'
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
        gap: '1.2rem',
        maxWidth: '180px',
      }}
      className="hidden lg:flex"
    >
      {SKILLS_GROUPS.map((group) => (
        <div key={group.category} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.35rem' }}>
          {/* Category Header Label */}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.5rem',
              fontWeight: 'bold',
              letterSpacing: '0.15em',
              color: 'var(--text-dim)',
              marginBottom: '0.2rem',
              opacity: 0.8,
            }}
          >
            {group.category}
          </span>

          {/* Group Skills */}
          {group.skills.map((skill) => {
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
                  textShadow: isHighlighted ? '0 0 10px rgba(251, 191, 36, 0.3)' : 'none',
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
      ))}
    </div>
  );
}
