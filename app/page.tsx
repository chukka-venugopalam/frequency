'use client';

import { useCallback, useState } from 'react';
import { ReactLenis, useLenis } from 'lenis/react';
import { StationProvider, useStationContext } from '@/app/providers';
import { stations } from '@/lib/stations';
import SignOn from '@/components/SignOn';
import Station from '@/components/Station';
import SkillsSignal from '@/components/SkillsSignal';
import OffAir from '@/components/OffAir';
import { motion } from 'framer-motion';

function ScrollProgressTracker() {
  const [progress, setProgress] = useState(0);

  // Wire Lenis scroll progress to local state
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleScroll = useCallback((lenis: any) => {
    setProgress(lenis.progress);
  }, []);

  useLenis(handleScroll);

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: 'var(--accent)',
        scaleX: progress,
        transformOrigin: 'left',
        zIndex: 100,
        opacity: progress > 0.01 ? 0.8 : 0,
        boxShadow: '0 0 8px var(--accent)',
      }}
      transition={{ opacity: { duration: 0.3 } }}
    />
  );
}

function PortfolioContent() {
  const { setActiveStationId } = useStationContext();

  const projectStations = stations.filter((s) => s.type === 'project');
  const aboutStation = stations.find((s) => s.type === 'about');

  return (
    <>
      {/* Scroll indicator bar at the top */}
      <ScrollProgressTracker />

      {/* Floating Skills Nav in sidebar */}
      <SkillsSignal />

      {/* Main Content Layout */}
      <div className="content-layer">
        {/* Scene 1: Sign On Hero */}
        <SignOn />

        {/* Scene 2: About / Professional Context */}
        {aboutStation && (
          <section className="frequency-section" id="station-about">
            <motion.div
              onViewportEnter={() => setActiveStationId('about')}
              className="skills-container"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: '-35% 0px -35% 0px' }}
              transition={{ duration: 0.8 }}
            >
              <h2>The Craft</h2>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.8,
                  marginBottom: '2.5rem',
                  fontWeight: 300,
                }}
              >
                I am a full-stack engineer and creative developer based in Brooklyn, building
                performant web experiences, interactive systems, and high-fidelity interfaces.
                My focus lies in bridging the space between visual design and highly scalable frontend architecture.
              </p>
            </motion.div>
          </section>
        )}

        {/* Scenes 3 - 9: Live Demos (including the new 3D/WebGL demo) */}
        {projectStations.map((station) => (
          <Station key={station.id} station={station} />
        ))}

        {/* Scene 10: Off Air / Contact */}
        <OffAir />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <StationProvider>
      <ReactLenis
        root
        options={{
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1.0,
          touchMultiplier: 1.5,
        }}
      >
        <PortfolioContent />
      </ReactLenis>
    </StationProvider>
  );
}
