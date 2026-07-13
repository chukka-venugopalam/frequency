'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useStationContext } from '@/app/providers';

export default function OffAir() {
  const { setActiveStationId } = useStationContext();
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Map progress (0 = enters viewport bottom, 0.5 = centered, 1 = leaves viewport top)
  const opacity = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [80, 0, 0, -80]);
  const blurValue = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [16, 0, 0, 16]);
  const filter = useTransform(blurValue, (b) => `blur(${b}px)`);

  return (
    <section
      ref={sectionRef}
      className="frequency-section"
      id="station-contact"
      style={{ overflow: 'hidden' }}
    >
      <motion.div
        onViewportEnter={() => setActiveStationId('contact')}
        viewport={{ margin: '-30% 0px -30% 0px' }}
        className="contact-container"
        style={{
          opacity,
          y,
          filter,
        }}
      >
        <h2>Get In Touch</h2>
        <p>
          If you&apos;d like to collaborate or just say hello, feel free to
          send a message. I&apos;m always open to discussing new projects,
          creative ideas, or frontend design systems.
        </p>
        <div className="contact-links">
          <a
            href="mailto:hello@frequency.dev"
            className="contact-link"
            rel="noopener noreferrer"
          >
            ✦ Email
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link"
          >
            ✦ GitHub
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="contact-link"
          >
            ✦ LinkedIn
          </a>
        </div>
        <p
          style={{
            marginTop: '4rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: 'var(--text-dim)',
            letterSpacing: '0.15em',
          }}
        >
          DRIFT PORTFOLIO • {new Date().getFullYear()}
        </p>
      </motion.div>
    </section>
  );
}
