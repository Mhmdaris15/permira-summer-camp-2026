/**
 * Decorative environment props — rocks, bushes, lanterns.
 * Positions are hand-picked for visual balance and clear of zone patches.
 */
import { Float } from "@react-three/drei";

type RockSpec = { pos: [number, number]; scale: number; tone: 0 | 1 };
type BushSpec = { pos: [number, number]; scale: number };
type LanternSpec = { pos: [number, number] };

const ROCKS: RockSpec[] = [
  { pos: [-18,  -4], scale: 1.0, tone: 0 },
  { pos: [-19,   8], scale: 0.7, tone: 1 },
  { pos: [ 19,  -4], scale: 0.9, tone: 0 },
  { pos: [ 20,   1], scale: 0.6, tone: 1 },
  { pos: [ -8,  14], scale: 0.8, tone: 0 },
  { pos: [  8,  -7], scale: 0.6, tone: 1 },
];

const BUSHES: BushSpec[] = [
  { pos: [-16,   4], scale: 1.0 },
  { pos: [ -8,  -8], scale: 0.9 },
  { pos: [ 11,  -8], scale: 1.0 },
  { pos: [ 20,   7], scale: 0.85 },
  { pos: [ -4,  13], scale: 0.9 },
  { pos: [ -16, -6], scale: 0.7 },
];

const LANTERNS: LanternSpec[] = [
  { pos: [-8,  2] },
  { pos: [ 9,  2] },
  { pos: [ 3, -4] },
  { pos: [ 3,  7] },
];

export function Props() {
  return (
    <group>
      {ROCKS.map((r, i) => (
        <Rock key={`r-${i}`} {...r} />
      ))}
      {BUSHES.map((b, i) => (
        <Bush key={`b-${i}`} {...b} />
      ))}
      {LANTERNS.map((l, i) => (
        <Lantern key={`l-${i}`} {...l} />
      ))}
    </group>
  );
}

function Rock({ pos, scale, tone }: RockSpec) {
  const color = tone === 0 ? "#9c9690" : "#7a7570";
  return (
    <mesh
      castShadow
      receiveShadow
      position={[pos[0], 0.25 * scale, pos[1]]}
      rotation={[0.2, pos[0] * 0.13, 0.1]}
      scale={scale}
    >
      <icosahedronGeometry args={[0.6, 0]} />
      <meshStandardMaterial color={color} roughness={1} flatShading />
    </mesh>
  );
}

function Bush({ pos, scale }: BushSpec) {
  return (
    <group position={[pos[0], 0, pos[1]]} scale={scale}>
      <mesh castShadow position={[0, 0.4, 0]}>
        <icosahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#5a8f37" roughness={1} flatShading />
      </mesh>
      <mesh castShadow position={[0.5, 0.3, 0.2]}>
        <icosahedronGeometry args={[0.45, 0]} />
        <meshStandardMaterial color="#4a7c3a" roughness={1} flatShading />
      </mesh>
      <mesh castShadow position={[-0.4, 0.32, -0.15]}>
        <icosahedronGeometry args={[0.4, 0]} />
        <meshStandardMaterial color="#69a04a" roughness={1} flatShading />
      </mesh>
    </group>
  );
}

function Lantern({ pos }: LanternSpec) {
  return (
    <Float speed={1.6} rotationIntensity={0} floatIntensity={0.18}>
      <group position={[pos[0], 0, pos[1]]}>
        {/* Pole */}
        <mesh castShadow position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.4, 6]} />
          <meshStandardMaterial color="#2c130b" roughness={0.7} />
        </mesh>
        {/* Lantern body */}
        <mesh castShadow position={[0, 1.55, 0]}>
          <boxGeometry args={[0.35, 0.45, 0.35]} />
          <meshStandardMaterial color="#f5b942" emissive="#f5b942" emissiveIntensity={0.55} roughness={0.4} />
        </mesh>
        {/* Roof */}
        <mesh position={[0, 1.88, 0]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[0.3, 0.2, 4]} />
          <meshStandardMaterial color="#3a2010" />
        </mesh>
      </group>
    </Float>
  );
}
