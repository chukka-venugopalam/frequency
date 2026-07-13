'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const contactVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const contactChildVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function OffAir() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [60, 0, 0, -60]);
  const blurValue = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [12, 0, 0, 12]);
  const filter = useTransform(blurValue, (b) => `blur(${b}px)`);

  return (
    <section
      ref={sectionRef}
      className="frequency-section"
      id="station-off-air"
      style={{ overflow: 'hidden' }}
    >
      <motion.div
        className="contact-container"
        style={{ opacity, y, filter }}
      >
        <motion.div
          variants={contactVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
        >
          <motion.h2 variants={contactChildVariants}>Get in Touch</motion.h2>
          <motion.p variants={contactChildVariants}>
            If you&apos;d like to get in touch, send a transmission through
            any of the channels below.
          </motion.p>
          <motion.div variants={contactChildVariants} className="contact-links">
            <a
              href="mailto:hello@frequency.dev"
              className="contact-link"
              rel="noopener noreferrer"
            >
              Email
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              LinkedIn
            </a>
          </motion.div>
          <motion.p
            variants={contactChildVariants}
            style={{
              marginTop: '3rem',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.6rem',
              color: 'var(--text-dim)',
              letterSpacing: '0.15em',
            }}
          >
            &copy; {new Date().getFullYear()} &middot; VENUGOPALAM CHUKKA
          </motion.p>
        </motion.div>
      </motion.div>
    </section>
  );
}
