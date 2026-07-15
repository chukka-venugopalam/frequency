'use client';

import { useCallback, useRef, useState } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import GroveScene from '@/components/GroveScene';

export default function Home() {
  const scrollRef = useRef(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Memoized Lenis scroll callback
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleScroll = useCallback((lenis: any) => {
    scrollRef.current = lenis.progress;
    setScrollProgress(lenis.progress);
  }, []);

  useLenis(handleScroll);

  return (
    <ReactLenis
      root
      options={{
        duration: 1.5,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
      }}
    >
      <main style={{ position: 'relative', width: '100%' }}>
        {/* Full-screen 3D dolly scene */}
        <GroveScene scrollRef={scrollRef} />

        {/* Status HUD overlay */}
        <div
          style={{
            position: 'fixed',
            top: 24,
            left: 24,
            zIndex: 10,
            fontFamily: 'monospace',
            color: '#9ca3af',
            fontSize: '0.85rem',
            background: 'rgba(0,0,0,0.7)',
            padding: '12px 16px',
            borderRadius: '6px',
            border: '1px solid #374151',
          }}
        >
          <div>SCENE: GROVE (STAGE 1)</div>
          <div>PROGRESS: {(scrollProgress * 100).toFixed(1)}%</div>
          <div style={{ marginTop: '4px', fontSize: '0.75rem', color: '#14b8a6' }}>
            CAMERA PATH DOLLY PIPELINE ACTIVE
          </div>
        </div>

        {/* Dummy scroll area */}
        <div style={{ height: '500vh', width: '100%', pointerEvents: 'none' }} />
      </main>
    </ReactLenis>
  );
}
