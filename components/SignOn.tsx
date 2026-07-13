'use client';

import { motion } from 'framer-motion';
import { useFrequencyContext } from '@/app/providers';

export default function SignOn() {
  const { frequency } = useFrequencyContext();
  const isActive = frequency.currentStation?.id === 'sign-on';
  // Only show when signal is strong enough
  const opacity = isActive ? frequency.signalStrength : 0;

  return (
    <section className="frequency-section" id="station-sign-on">
      <motion.div
        className="sign-on-content"
        style={{
          opacity,
          filter: `blur(${(1 - frequency.signalStrength) * 8}px)`,
          transition: 'opacity 0.5s ease, filter 0.5s ease',
        }}
      >
        <h1 className="name">
          VENUGOPALAM
          <br />
          CHUKKA
        </h1>
        <p className="role">Full-Stack Engineer &amp; Creative Developer</p>
        <div
          style={{
            marginTop: '2rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--amber-dim)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase' as const,
            opacity: 0.6,
          }}
        >
          Tune in to explore
        </div>
      </motion.div>
    </section>
  );
}
