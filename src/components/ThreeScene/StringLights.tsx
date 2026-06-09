/**
 * StringLights — bulbs strung between anchor points by the campfire.
 * Each bulb is an emissive sphere; the wire is a thin <Line> (drei).
 * Adds the "alive, warm" atmosphere of an evening campsite without
 * relying on post-processing.
 */
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { COLORS, STRING_LIGHT_ANCHORS } from "./layout";

export function StringLights() {
  return (
    <group>
      {STRING_LIGHT_ANCHORS.map((anchors, i) => (
        <Strand key={i} from={anchors[0]} to={anchors[1]} bulbCount={6} index={i} />
      ))}
    </group>
  );
}

type StrandProps = {
  from: [number, number, number];
  to: [number, number, number];
  bulbCount: number;
  index: number;
};

function Strand({ from, to, bulbCount, index }: StrandProps) {
  const bulbsRef = useRef<THREE.Group>(null);

  // Build a sagging curve between two points.
  const points = useMemo(() => {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const length = start.distanceTo(end);
    const sag = Math.min(0.5, length * 0.08);
    const pts: THREE.Vector3[] = [];
    const samples = 24;
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const p = new THREE.Vector3().lerpVectors(start, end, t);
      // parabolic sag — strongest at midpoint
      p.y -= Math.sin(t * Math.PI) * sag;
      pts.push(p);
    }
    return pts;
  }, [from, to]);

  // Sample bulb positions along the same curve.
  const bulbPositions = useMemo(() => {
    const positions: Array<[number, number, number]> = [];
    for (let i = 0; i < bulbCount; i++) {
      const t = (i + 1) / (bulbCount + 1);
      const idx = Math.round(t * (points.length - 1));
      const p = points[idx];
      positions.push([p.x, p.y, p.z]);
    }
    return positions;
  }, [points, bulbCount]);

  // Gentle warm shimmer — phase-shifted per bulb.
  useFrame((state) => {
    if (!bulbsRef.current) return;
    const t = state.clock.elapsedTime;
    bulbsRef.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat && "emissiveIntensity" in mat) {
        const phase = i * 0.5 + index * 0.3;
        mat.emissiveIntensity = 0.85 + Math.sin(t * 2.4 + phase) * 0.15;
      }
    });
  });

  return (
    <group>
      <Line
        points={points.map((p) => [p.x, p.y, p.z])}
        color={COLORS.fireBase}
        lineWidth={1.2}
        transparent
        opacity={0.85}
      />
      <group ref={bulbsRef}>
        {bulbPositions.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.09, 8, 8]} />
            <meshStandardMaterial
              color={COLORS.lanternGlow}
              emissive={COLORS.lanternGlow}
              emissiveIntensity={0.9}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
