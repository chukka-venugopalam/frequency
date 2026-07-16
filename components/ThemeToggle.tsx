'use client';

import { motion } from 'framer-motion';
import { useThemeContext } from '@/app/providers';
import { themes } from '@/lib/themes';

export default function ThemeToggle() {
  const { theme, setTheme } = useThemeContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 100,
        display: 'flex',
        gap: '0.25rem',
        padding: '3px',
        borderRadius: 9999,
        border: '1px solid var(--card-border)',
        background: 'var(--bg-elevated)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {themes.map((t) => (
        <motion.button
          key={t.id}
          onClick={() => setTheme(t.id)}
          aria-label={`Switch to ${t.label} theme`}
          title={t.label}
          type="button"
          whileHover={{ scale: 1.15, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          whileTap={{ scale: 0.92 }}
          style={{
            border: 'none',
            background: theme === t.id ? 'var(--accent-glow)' : 'transparent',
            color: theme === t.id ? 'var(--accent)' : 'var(--text-dim)',
            width: 28,
            height: 28,
            borderRadius: '50%',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.3s ease, color 0.3s ease',
          }}
        >
          {t.icon}
        </motion.button>
      ))}
    </motion.div>
  );
}
