'use client';

import { Canvas } from '@react-three/fiber';
import DollyPath from './DollyPath';

interface GroveSceneProps {
  scrollRef: React.RefObject<number>;
}

export default function GroveScene({ scrollRef }: GroveSceneProps) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none', // Enforce pointer-events: none on wrapper
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 15], fov: 60 }}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          pointerEvents: 'none', // Enforce pointer-events: none on Canvas element
        }}
      >
        {/* Stage 2 Ambient environment: soft deep green-black */}
        <color attach="background" args={['#050c08']} />

        {/* Soft fog to make elements recede naturally into distance */}
        <fog attach="fog" args={['#050c08', 4, 22]} />

        {/* Dense garden ambient light */}
        <ambientLight intensity={0.3} color="#0f291e" />

        {/* Warm golden light filtering through trees */}
        <directionalLight
          position={[12, 15, 8]}
          intensity={2.2}
          color="#fcd34d" // Warm gold / low sun
        />
        
        {/* Soft fill lighting */}
        <pointLight position={[-10, 5, -5]} intensity={0.6} color="#050c08" />

        <DollyPath scrollRef={scrollRef} />
      </Canvas>
    </div>
  );
}
