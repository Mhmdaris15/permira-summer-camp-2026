/**
 * Sky — minimalist atmospheric layer: a few low-poly cloud puffs that
 * drift slowly. Each puff is a cluster of squished spheres; no billboards,
 * no shaders. Purely decorative; safe to remove with no scene impact.
 */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

type Puff = {
  position: [number, number, number];
  scale: number;
  speed: number;
};

const PUFFS: Puff[] = [
  { position: [-12, 16, -10], scale: 1.4, speed: 0.06 },
  { position: [  6, 18,  -6], scale: 1.0, speed: 0.04 },
  { position: [ 16, 17,   8], scale: 1.2, speed: 0.05 },
  { position: [-18, 19,   4], scale: 0.9, speed: 0.07 },
];

const WRAP_AT = 30;

export function Sky() {
  return (
    <group>
      {PUFFS.map((p, i) => (
        <DriftingPuff key={i} {...p} />
      ))}
    </group>
  );
}

function DriftingPuff({ position, scale, speed }: Puff) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.position.x += dt * speed;
    if (ref.current.position.x > WRAP_AT) ref.current.position.x = -WRAP_AT;
  });

  return (
    <Float speed={0.6} rotationIntensity={0} floatIntensity={0.4}>
      <group ref={ref} position={position} scale={scale}>
        <Puff offset={[ 0,    0, 0]} radius={1.6}  />
        <Puff offset={[ 1.4,  0.2, 0.4]} radius={1.2} />
        <Puff offset={[-1.3,  0.1, -0.2]} radius={1.3} />
        <Puff offset={[ 0.5, -0.3,  0.8]} radius={1.0} />
      </group>
    </Float>
  );
}

function Puff({ offset, radius }: { offset: [number, number, number]; radius: number }) {
  return (
    <mesh position={offset} scale={[1, 0.65, 1]}>
      <icosahedronGeometry args={[radius, 1]} />
      <meshStandardMaterial color="#ffffff" roughness={1} flatShading />
    </mesh>
  );
}
