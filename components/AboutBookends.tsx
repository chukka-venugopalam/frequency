'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface AboutBookendsProps {
  scrollProgress: number;
}

export default function AboutBookends({ scrollProgress }: AboutBookendsProps) {
  const showIntro = scrollProgress < 0.06;
  const showOutro = scrollProgress > 0.94;

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 7,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.025) 0%, transparent 80%)',
            }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              style={{
                textAlign: 'center',
                maxWidth: 680,
                padding: '2.5rem',
                background: 'rgba(5, 12, 8, 0.82)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                pointerEvents: 'auto',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  color: 'var(--accent)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                }}
              >
                Welcome to the Grove
              </span>
              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(2.5rem, 5vw, 3.8rem)',
                  fontWeight: 400,
                  color: '#ffffff',
                  margin: '0.8rem 0 1.2rem 0',
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                }}
              >
                VENUGOPALAM CHUKKA
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: '0 0 2rem 0',
                  fontWeight: 300,
                }}
              >
                Creative Frontend Engineering &amp; Interactive Systems.
                <br />
                <span style={{ color: '#f4f6f4', fontWeight: 400 }}>
                  Sculpting silent motion, organic web physics, and breathing digital landscapes.
                </span>
              </p>
              
              {/* Subtle animated down arrow */}
              <motion.div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  color: 'var(--accent)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              >
                Scroll to explore the garden &darr;
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showOutro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 7,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.025) 0%, transparent 80%)',
            }}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              style={{
                textAlign: 'center',
                maxWidth: 620,
                padding: '2.5rem',
                background: 'rgba(5, 12, 8, 0.85)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '16px',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
                pointerEvents: 'auto',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.68rem',
                  color: 'var(--accent)',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                }}
              >
                Reaching the Clearing
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: '2.2rem',
                  fontWeight: 400,
                  color: '#ffffff',
                  margin: '0.8rem 0 1rem 0',
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                }}
              >
                Let&apos;s grow something beautiful together.
              </h2>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.88rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  margin: '0 0 2.2rem 0',
                }}
              >
                I design and build interactive web experiences that balance aesthetic calm with high-performance code. If you would like to collaborate, discuss a project, or just say hello, get in touch.
              </p>
              
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1.2rem',
                  marginBottom: '2.5rem',
                }}
              >
                <motion.a
                  href="mailto:chukkavenugopalam@gmail.com"
                  className="contact-link"
                  whileHover={{ scale: 1.06, borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    padding: '0.6rem 1.3rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '9999px',
                    background: 'var(--bg-subtle)',
                    transition: 'border-color 0.3s ease, color 0.3s ease',
                  }}
                >
                  ✦ Email
                </motion.a>
                <motion.a
                  href="https://github.com/chukka-venugopalam"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                  whileHover={{ scale: 1.06, borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    padding: '0.6rem 1.3rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '9999px',
                    background: 'var(--bg-subtle)',
                    transition: 'border-color 0.3s ease, color 0.3s ease',
                  }}
                >
                  ✦ GitHub
                </motion.a>
                <motion.a
                  href="https://linkedin.com/in/venugopalam-chukka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                  whileHover={{ scale: 1.06, borderColor: 'var(--accent)', color: 'var(--accent)' }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    padding: '0.6rem 1.3rem',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '9999px',
                    background: 'var(--bg-subtle)',
                    transition: 'border-color 0.3s ease, color 0.3s ease',
                  }}
                >
                  ✦ LinkedIn
                </motion.a>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6rem',
                  color: 'var(--text-dim)',
                  letterSpacing: '0.15em',
                  margin: 0,
                }}
              >
                DRIFT PORTFOLIO • {new Date().getFullYear()}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
