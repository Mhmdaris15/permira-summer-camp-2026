/**
 * Terrain — composed of three stacked plates that give the campsite a
 * sense of being an island in a meadow:
 *
 *   1. Outer cylinder slab — solid base, slight thickness for "ground depth"
 *   2. Mid grass plate — the main camp lawn
 *   3. Inner field plate — a lighter mown clearing
 *
 * Plus a thin border ring + a scatter of stylized grass tufts.
 */
import { useMemo } from "react";
import { COLORS, TERRAIN } from "./layout";

export function Terrain() {
  // Pre-compute deterministic grass tuft positions outside hot zones.
  const tufts = useMemo(() => generateTufts(80), []);

  return (
    <group>
      {/* Earth slab — gives the ground actual thickness when viewed at angle */}
      <mesh receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[TERRAIN.width + 4, 1, TERRAIN.depth + 4]} />
        <meshStandardMaterial color="#7a5a3a" roughness={1} />
      </mesh>

      {/* Main lawn */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[TERRAIN.width, TERRAIN.depth, 1, 1]} />
        <meshStandardMaterial color={COLORS.grass} roughness={0.95} />
      </mesh>

      {/* Inner clearing — slightly lighter, suggests "the mown camp area" */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[TERRAIN.width - 6, TERRAIN.depth - 6]} />
        <meshStandardMaterial color={COLORS.grassDeep} roughness={0.95} />
      </mesh>

      {/* Grass tufts — small cones giving organic texture without polycount */}
      {tufts.map((t, i) => (
        <Tuft key={i} position={t.pos} scale={t.scale} dark={t.dark} />
      ))}
    </group>
  );
}

function Tuft({
  position,
  scale,
  dark,
}: {
  position: [number, number, number];
  scale: number;
  dark: boolean;
}) {
  return (
    <mesh position={position} scale={[scale, scale * 1.4, scale]}>
      <coneGeometry args={[0.18, 0.34, 5]} />
      <meshStandardMaterial color={dark ? "#5a8f37" : "#7fb04a"} roughness={1} flatShading />
    </mesh>
  );
}

/**
 * Deterministic pseudo-random tuft scatter avoiding the camp's central
 * zones (where it would visually fight with patches/paths).
 */
function generateTufts(count: number) {
  const out: Array<{ pos: [number, number, number]; scale: number; dark: boolean }> = [];
  let seed = 21;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  const halfW = TERRAIN.width / 2 - 1;
  const halfD = TERRAIN.depth / 2 - 1;

  let tries = 0;
  while (out.length < count && tries < count * 8) {
    tries++;
    const x = (rand() * 2 - 1) * halfW;
    const z = (rand() * 2 - 1) * halfD;
    // Keep tufts to the outer ring — avoid central -10..10 x -6..6 zone.
    if (Math.abs(x) < 10 && Math.abs(z) < 6) continue;
    out.push({
      pos: [x, 0.17, z],
      scale: 0.6 + rand() * 0.7,
      dark: rand() > 0.55,
    });
  }
  return out;
}
