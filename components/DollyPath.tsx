'use client';

import { useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import DewLeafPlant from './DewLeafPlant';
import PollenFirefliesPlant from './PollenFirefliesPlant';
import BuddingSeedClusterPlant from './BuddingSeedClusterPlant';
import GrowingVinePlant from './GrowingVinePlant';
import DappledLightPlant from './DappledLightPlant';

interface MarkerProps {
  position: THREE.Vector3;
  targetT: number;
  scrollProgress: number;
  onActiveChange?: (active: boolean) => void;
}

function PlaceholderMarker({ position, targetT, scrollProgress, onActiveChange }: MarkerProps) {
  const [isNear, setIsNear] = useState(false);
  const [prevScroll, setPrevScroll] = useState(0);
  const diff = Math.abs(scrollProgress - targetT);
  const isLast = Math.abs(targetT - 0.96) < 0.01;

  // ESLint-safe hysteresis state synchronization during render
  if (scrollProgress !== prevScroll) {
    setPrevScroll(scrollProgress);
    if (isLast && scrollProgress > 0.93) {
      setIsNear(false);
    } else if (isNear) {
      if (diff > 0.12) {
        setIsNear(false);
      }
    } else {
      if (diff < 0.08) {
        // Prevent activation if we are already in the outro zone
        if (!(isLast && scrollProgress > 0.93)) {
          setIsNear(true);
        }
      }
    }
  }

  useEffect(() => {
    if (onActiveChange) {
      onActiveChange(isNear);
    }
  }, [isNear, onActiveChange]);

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

interface TrackerProps {
  position: THREE.Vector3;
  scrollProgress: number;
  seedPodDOMRef: React.RefObject<HTMLDivElement | null>;
  setScrollProgress: (p: number) => void;
}

function SeedPodTracker({
  position,
  scrollProgress,
  seedPodDOMRef,
  setScrollProgress,
}: TrackerProps) {
  const { camera } = useThree();
  const tempV = new THREE.Vector3();

  useFrame(() => {
    // Sync the current scrollProgress to the outer state
    setScrollProgress(scrollProgress);

    if (!seedPodDOMRef.current) return;

    // Project 3D position to 2D screen coords relative to current camera
    tempV.copy(position);
    tempV.project(camera);

    const isBehind = tempV.z > 1;
    const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
    const y = (tempV.y * -0.5 + 0.5) * window.innerHeight;

    // Drei-style distance factor scaling
    const dist = camera.position.distanceTo(position);
    let fovFactor = 1;
    if ('fov' in camera) {
      fovFactor = Math.tan(((camera as THREE.PerspectiveCamera).fov * Math.PI) / 360) * 2;
    }
    const scale = 1 / (dist * fovFactor);

    const element = seedPodDOMRef.current;
    if (isBehind) {
      element.style.display = 'none';
    } else {
      element.style.display = 'flex';
      element.style.transform = `translate3d(calc(${x}px - 50%), calc(${y}px - 50%), 0) scale(${scale * 6})`;
    }
  });

  return null;
}

interface DollyPathProps {
  scrollRef: React.RefObject<number>;
  seedPodDOMRef: React.RefObject<HTMLDivElement | null>;
  setScrollProgress: (progress: number) => void;
  onActivePlantChange: (index: number, active: boolean) => void;
}

export default function DollyPath({ scrollRef, seedPodDOMRef, setScrollProgress, onActivePlantChange }: DollyPathProps) {
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
    const targetTs = [0.12, 0.26, 0.40, 0.54, 0.68, 0.82, 0.96];
    const offsets = [
      new THREE.Vector3(1.6, -0.6, 0),    // Plant 0 (Spring Seed Pod)
      new THREE.Vector3(-1.8, 0.5, 0),   // Plant 1 (Dew Leaf)
      new THREE.Vector3(1.8, -0.5, 0),    // Plant 2 (Pollen Fireflies)
      new THREE.Vector3(-1.8, 0.8, 0),   // Plant 3 (Budding Crystals)
      new THREE.Vector3(1.8, -0.8, 0),    // Plant 4 (Growing Vine)
      new THREE.Vector3(-1.8, 0.4, 0),   // Plant 5 (Dappled Stone)
      new THREE.Vector3(0, -0.2, 0.5),   // Waypoint 6 (Waypoint Core)
    ];

    return targetTs.map((targetT, idx) => {
      const splinePos = curve.getPointAt(targetT);
      const position = splinePos.clone().add(offsets[idx]);
      return { position, targetT };
    });
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
            <SeedPodTracker
              key={idx}
              position={marker.position}
              scrollProgress={localScroll}
              seedPodDOMRef={seedPodDOMRef}
              setScrollProgress={setScrollProgress}
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
              onActiveChange={(active) => onActivePlantChange(idx, active)}
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
              onActiveChange={(active) => onActivePlantChange(idx, active)}
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
              onActiveChange={(active) => onActivePlantChange(idx, active)}
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
              onActiveChange={(active) => onActivePlantChange(idx, active)}
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
              onActiveChange={(active) => onActivePlantChange(idx, active)}
            />
          );
        }
        return (
          <PlaceholderMarker
            key={idx}
            position={marker.position}
            targetT={marker.targetT}
            scrollProgress={localScroll}
            onActiveChange={(active) => onActivePlantChange(idx, active)}
          />
        );
      })}
    </group>
  );
}
