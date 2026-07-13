'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type { ThemeId } from '@/lib/themes';

/* ─── Theme Context ─── */

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  cycleTheme: () => void;
}

const ThemeCtx = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>('dark');

  const setTheme = useCallback((t: ThemeId) => {
    setThemeState(t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  // Set initial data-theme attribute on mount
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const cycleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'mixed' : 'dark');
  }, [theme, setTheme]);

  return (
    <ThemeCtx.Provider value={{ theme, setTheme, cycleTheme }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider');
  return ctx;
}

/* ─── Station Context ─── */

interface StationContextValue {
  activeStationId: string | null;
  setActiveStationId: (id: string | null) => void;
}

const StationCtx = createContext<StationContextValue | null>(null);

export function StationProvider({ children }: { children: ReactNode }) {
  const [activeStationId, setActiveStationId] = useState<string | null>(null);

  return (
    <StationCtx.Provider value={{ activeStationId, setActiveStationId }}>
      {children}
    </StationCtx.Provider>
  );
}

export function useStationContext() {
  const ctx = useContext(StationCtx);
  if (!ctx) throw new Error('useStationContext must be used within StationProvider');
  return ctx;
}
