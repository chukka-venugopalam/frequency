'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { useFrequency, type FrequencyState } from '@/lib/useFrequency';

/* ─── Frequency Context ─── */

interface FrequencyContextValue {
  frequency: FrequencyState;
  scrollProgress: number;
  setScrollProgress: (val: number) => void;
  lockedStationId: string | null;
  setLockedStationId: (id: string | null) => void;
}

const FrequencyContext = createContext<FrequencyContextValue | null>(null);

export function FrequencyProvider({ children }: { children: ReactNode }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [lockedStationId, setLockedStationId] = useState<string | null>(null);
  const frequency = useFrequency(scrollProgress, lockedStationId, setLockedStationId);

  return (
    <FrequencyContext.Provider
      value={{
        frequency,
        scrollProgress,
        setScrollProgress,
        lockedStationId,
        setLockedStationId,
      }}
    >
      {children}
    </FrequencyContext.Provider>
  );
}

export function useFrequencyContext() {
  const ctx = useContext(FrequencyContext);
  if (!ctx) throw new Error('useFrequencyContext must be used within FrequencyProvider');
  return ctx;
}

/* ─── Audio Context ─── */

interface AudioContextValue {
  isMuted: boolean;
  toggleMute: () => void;
  playTuningStatic: (intensity: number) => void;
  playLockChime: () => void;
  isAudioReady: boolean;
}

const AudioCtx = createContext<AudioContextValue | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(true);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const staticSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const staticGainRef = useRef<GainNode | null>(null);
  const staticFilterRef = useRef<BiquadFilterNode | null>(null);

  const initAudio = useCallback(() => {
    if (audioContextRef.current) return;
    const ctx = new AudioContext();
    audioContextRef.current = ctx;
    console.log('[Audio] Context created, state:', ctx.state);
    if (ctx.state === 'suspended') {
      ctx.resume();
      console.log('[Audio] Context resumed, state:', ctx.state);
    }
    setIsAudioReady(true);
  }, []);

  const toggleMute = useCallback(() => {
    initAudio();
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
      console.log('[Audio] Safety resume on toggle, state:', audioContextRef.current.state);
    }
    setIsMuted((prev) => !prev);
  }, [initAudio]);

  // Initialize static noise source once
  useEffect(() => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const bufferSize = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2000;
    filter.Q.value = 0.5;

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);

    staticSourceRef.current = source;
    staticGainRef.current = gainNode;
    staticFilterRef.current = filter;

    return () => {
      source.stop();
      source.disconnect();
      gainNode.disconnect();
      filter.disconnect();
    };
  }, [isAudioReady]);

  const playTuningStatic = useCallback(
    (intensity: number) => {
      const ctx = audioContextRef.current;
      if (!ctx || isMuted) return;

      const gainNode = staticGainRef.current;
      const filter = staticFilterRef.current;

      if (!gainNode || !filter) return;

      // Smoothly modulate gain in sync with signal strength
      // intensity is 1 at full static, 0 at clear signal
      const targetGain = Math.min(intensity * 0.15, 0.15); // bumped for testing
      gainNode.gain.linearRampToValueAtTime(targetGain, ctx.currentTime + 0.08);

      // Modulate filter frequency: harsher at low signal, smoother at high signal
      filter.frequency.linearRampToValueAtTime(
        800 + intensity * 3200,
        ctx.currentTime + 0.08
      );
    },
    [isMuted]
  );

  const playLockChime = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || isMuted) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  }, [isMuted]);

  useEffect(() => {
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  return (
    <AudioCtx.Provider
      value={{ isMuted, toggleMute, playTuningStatic, playLockChime, isAudioReady }}
    >
      {children}
    </AudioCtx.Provider>
  );
}

export function useAudioContext() {
  const ctx = useContext(AudioCtx);
  if (!ctx) throw new Error('useAudioContext must be used within AudioProvider');
  return ctx;
}

/* ─── Current Station Context ─── — keeps track of the currently locked station */

interface StationContextValue {
  activeStationId: string | null;
  setActiveStationId: (id: string) => void;
  prevStationId: string | null;
}

const StationCtx = createContext<StationContextValue | null>(null);

export function StationProvider({ children }: { children: ReactNode }) {
  const [activeStationId, setActiveStationId] = useState<string | null>(null);
  const prevRef = useRef<string | null>(null);

  // Track previous station ID via ref to avoid stale closure
  const latestIdRef = useRef<string | null>(null);

  const handleSetActive = useCallback((id: string) => {
    prevRef.current = latestIdRef.current;
    latestIdRef.current = id;
    setActiveStationId(id);
  }, []);

  return (
    <StationCtx.Provider
      value={{
        activeStationId,
        setActiveStationId: handleSetActive,
        prevStationId: prevRef.current,
      }}
    >
      {children}
    </StationCtx.Provider>
  );
}

export function useStationContext() {
  const ctx = useContext(StationCtx);
  if (!ctx) throw new Error('useStationContext must be used within StationProvider');
  return ctx;
}
