'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useStationContext } from '@/app/providers';

const heroVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const heroChildVariants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function SignOn() {
  const { setActiveStationId } = useStationContext();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.8], [0, -100]);
  const blurValue = useTransform(scrollYProgress, [0, 0.8], [0, 16]);
  const filter = useTransform(blurValue, (b) => `blur(${b}px)`);

  return (
    <section
      ref={sectionRef}
      className="frequency-section"
      id="station-sign-on"
      style={{ overflow: 'hidden' }}
    >
      <motion.div
        onViewportEnter={() => setActiveStationId('sign-on')}
        viewport={{ margin: '-20% 0px -20% 0px' }}
        className="sign-on-content"
        style={{
          opacity,
          y,
          filter,
        }}
      >
        <motion.div
          variants={heroVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-20% 0px -20% 0px' }}
        >
          <motion.h1 variants={heroChildVariants} className="name">
            VENUGOPALAM
            <br />
            CHUKKA
          </motion.h1>
          <motion.p variants={heroChildVariants} className="role">
            Creative Frontend Engineering &amp; Interactive Systems
          </motion.p>

          <motion.div
            variants={heroChildVariants}
            style={{
              marginTop: '4rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.65rem',
              color: 'var(--accent)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase' as const,
            }}
            animate={{
              y: [0, 6, 0],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            Scroll to explore &darr;
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
