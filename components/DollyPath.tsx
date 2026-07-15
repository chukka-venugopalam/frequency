'use client';

import { useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import SpringPhysicsSeedPod from './SpringPhysicsSeedPod';
import DewLeafPlant from './DewLeafPlant';
import PollenFirefliesPlant from './PollenFirefliesPlant';
import BuddingSeedClusterPlant from './BuddingSeedClusterPlant';
import GrowingVinePlant from './GrowingVinePlant';
import DappledLightPlant from './DappledLightPlant';

interface MarkerProps {
  position: THREE.Vector3;
  targetT: number;
  scrollProgress: number;
}

function PlaceholderMarker({ position, targetT, scrollProgress }: MarkerProps) {
  const [isNear, setIsNear] = useState(false);
  const [prevScroll, setPrevScroll] = useState(0);
  const diff = Math.abs(scrollProgress - targetT);

  // ESLint-safe hysteresis state synchronization during render
  if (scrollProgress !== prevScroll) {
    setPrevScroll(scrollProgress);
    if (isNear) {
      if (diff > 0.12) {
        setIsNear(false);
      }
    } else {
      if (diff < 0.08) {
        setIsNear(true);
      }
    }
  }

  return (
    <mesh position={position}>
      <sphereGeometry args={isNear ? [0.35, 32, 32] : [0.25, 16, 16]} />
      <meshStandardMaterial
        color={isNear ? '#fbbf24' : '#4b5563'} // Warm gold or muted gray
        emissive={isNear ? '#f59e0b' : '#111827'} // Emissive golden glow
        emissiveIntensity={isNear ? 1.2 : 0.1}
        roughness={0.2}
        metalness={0.1}
      />
    </mesh>
  );
}

interface DollyPathProps {
  scrollRef: React.RefObject<number>;
}

export default function DollyPath({ scrollRef }: DollyPathProps) {
  const [localScroll, setLocalScroll] = useState(0);

  // Define a 3D Catmull-Rom spline curve winding through space
  const curve = useMemo(() => {
    const points = [
      new THREE.Vector3(0, 0, 15),
      new THREE.Vector3(4, 2, 8),
      new THREE.Vector3(-4, -1, 1),
      new THREE.Vector3(3, 3, -6),
      new THREE.Vector3(-3, 0, -13),
      new THREE.Vector3(4, -2, -20),
      new THREE.Vector3(0, 0, -27),
    ];
    return new THREE.CatmullRomCurve3(points);
  }, []);

  // Compute 7 marker coordinates along the curve
  const markers = useMemo(() => {
    const numMarkers = 7;
    const items = [];
    for (let i = 0; i < numMarkers; i++) {
      const targetT = i / (numMarkers - 1);
      const position = curve.getPointAt(targetT);
      items.push({ position, targetT });
    }
    return items;
  }, [curve]);

  useFrame((state) => {
    const t = scrollRef.current ?? 0;
    
    // Sync to state to update react markers' proximity styling
    setLocalScroll(t);

    // Position camera along the spline
    const camPos = curve.getPointAt(t);
    state.camera.position.lerp(camPos, 0.1);

    // Look slightly ahead along the spline
    const lookAtT = Math.min(1.0, t + 0.05);
    const lookTarget = curve.getPointAt(lookAtT);
    
    // Smooth target lookup
    const currentLookTarget = new THREE.Vector3();
    state.camera.getWorldDirection(currentLookTarget);
    currentLookTarget.add(state.camera.position);
    currentLookTarget.lerp(lookTarget, 0.1);
    
    state.camera.lookAt(currentLookTarget);
  });

  return (
    <group>
      {/* Draw spline path line for visual guide */}
      <line>
        <bufferGeometry>
          <float32BufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array(
                curve.getPoints(100).flatMap((p) => [p.x, p.y, p.z])
              ),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#374151" opacity={0.3} transparent />
      </line>

      {/* Render placeholder markers & actual plants */}
      {markers.map((marker, idx) => {
        if (idx === 0) {
          return (
            <SpringPhysicsSeedPod
              key={idx}
              position={[marker.position.x, marker.position.y, marker.position.z]}
              targetT={marker.targetT}
              scrollProgress={localScroll}
            />
          );
        }
        if (idx === 1) {
          return (
            <DewLeafPlant
              key={idx}
              position={[marker.position.x, marker.position.y, marker.position.z]}
              targetT={marker.targetT}
              scrollProgress={localScroll}
            />
          );
        }
        if (idx === 2) {
          return (
            <PollenFirefliesPlant
              key={idx}
              position={[marker.position.x, marker.position.y, marker.position.z]}
              targetT={marker.targetT}
              scrollProgress={localScroll}
            />
          );
        }
        if (idx === 3) {
          return (
            <BuddingSeedClusterPlant
              key={idx}
              position={[marker.position.x, marker.position.y, marker.position.z]}
              targetT={marker.targetT}
              scrollProgress={localScroll}
            />
          );
        }
        if (idx === 4) {
          return (
            <GrowingVinePlant
              key={idx}
              position={[marker.position.x, marker.position.y, marker.position.z]}
              targetT={marker.targetT}
              scrollProgress={localScroll}
            />
          );
        }
        if (idx === 5) {
          return (
            <DappledLightPlant
              key={idx}
              position={[marker.position.x, marker.position.y, marker.position.z]}
              targetT={marker.targetT}
              scrollProgress={localScroll}
            />
          );
        }
        return (
          <PlaceholderMarker
            key={idx}
            position={marker.position}
            targetT={marker.targetT}
            scrollProgress={localScroll}
          />
        );
      })}
    </group>
  );
}
