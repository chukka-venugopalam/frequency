'use client';

import { ReactLenis } from 'lenis/react';
import { StationProvider } from '@/app/providers';
import { stations } from '@/lib/stations';
import SignOn from '@/components/SignOn';
import Station from '@/components/Station';
import SkillsSignal from '@/components/SkillsSignal';
import OffAir from '@/components/OffAir';
import ScrollProgress from '@/components/ScrollProgress';

/* ─── Root Page ─── */

export default function Home() {
  return (
    <StationProvider>
      <ReactLenis
        root
        options={{
          duration: 1.4,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: 'vertical',
          smoothWheel: true,
          wheelMultiplier: 1,
          touchMultiplier: 1.5,
        }}
      >
        {/* Scroll Progress Indicator */}
        <ScrollProgress />

        {/* Skills Signal (ambient left sidebar) */}
        <SkillsSignal />

        {/* Main Content Sections */}
        <div className="content-layer">
          {/* Sign-On Landing */}
          <SignOn />

          {/* About / Skills Section */}
          <section className="frequency-section" id="station-about">
            <div className="skills-container">
              <h2>About</h2>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.7,
                  marginBottom: '2.5rem',
                }}
              >
                Full-stack engineer and creative developer. I build performant
                web applications, interactive experiences, and developer tools
                — always exploring the edge between code and craft.
              </p>
            </div>
          </section>

          {/* Project Stations */}
          {stations
            .filter((s) => s.type === 'project')
            .map((station) => (
              <Station key={station.id} station={station} />
            ))}

          {/* Off Air / Contact */}
          <OffAir />
        </div>
      </ReactLenis>
    </StationProvider>
  );
}
