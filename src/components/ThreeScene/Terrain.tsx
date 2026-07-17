/**
 * Terrain — composed of:
 *   1. Earth slab — thick base box, gives the camp visible ground depth
 *   2. Main lawn — large green plane
 *   3. Inner clearing — slightly lighter, marks the mown camp area
 *   4. Hills — low-poly raised polygons along the perimeter (HILLS in layout.ts)
 *   5. Grass tufts — small cones scattered outside hot zones
 *   6. Mist ring — translucent perimeter plane that fades the edges into sky
 *
 * Everything is primitive geometry; no displacement maps, no textures.
 */
import { useMemo } from "react";
import { COLORS, HILLS, TERRAIN } from "./layout";

export function Terrain() {
  const tufts = useMemo(() => generateTufts(110), []);

  return (
    <group>
      {/* Bay — a broad water plane the cape sits on. Kept just below the
          shore so the land reads as a spit ringed by water. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color={COLORS.water} roughness={0.35} metalness={0.1} />
      </mesh>

      {/* Earth slab */}
      <mesh receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[TERRAIN.width + 6, 1, TERRAIN.depth + 6]} />
        <meshStandardMaterial color={COLORS.earth} roughness={1} flatShading />
      </mesh>

      {/* Beach — a sandy rim around the lawn where land meets water */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <planeGeometry args={[TERRAIN.width + 4, TERRAIN.depth + 4]} />
        <meshStandardMaterial color={COLORS.sand} roughness={1} flatShading />
      </mesh>

      {/* Hills — low cones at the perimeter for gentle elevation */}
      {HILLS.map(([x, z, r, h], i) => (
        <mesh
          key={i}
          castShadow
          receiveShadow
          position={[x, h / 2 - 0.05, z]}
        >
          <coneGeometry args={[r, h, 18, 1, false]} />
          <meshStandardMaterial color={COLORS.grass} roughness={1} flatShading />
        </mesh>
      ))}

      {/* Main lawn */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[TERRAIN.width, TERRAIN.depth, 1, 1]} />
        <meshStandardMaterial color={COLORS.grass} roughness={0.95} />
      </mesh>

      {/* Inner clearing */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <planeGeometry args={[TERRAIN.width - 6, TERRAIN.depth - 6]} />
        <meshStandardMaterial color={COLORS.grassDeep} roughness={0.95} />
      </mesh>

      {/* Grass tufts */}
      {tufts.map((t, i) => (
        <Tuft key={i} position={t.pos} scale={t.scale} dark={t.dark} />
      ))}

      {/* Perimeter mist ring — soft alpha fade at the edges */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.55, 0]}>
        <ringGeometry args={[TERRAIN.width / 2 - 2, TERRAIN.width / 2 + 4, 64]} />
        <meshBasicMaterial color={COLORS.skyHorizon} transparent opacity={0.18} depthWrite={false} />
      </mesh>
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
      <meshStandardMaterial
        color={dark ? COLORS.treeDark : COLORS.treeAccent}
        roughness={1}
        flatShading
      />
    </mesh>
  );
}

/**
 * Deterministic tuft scatter — pseudo-random but reproducible.
 * Avoids the central camp footprint (-10..10 X, -6..6 Z).
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
    if (Math.abs(x) < 10 && Math.abs(z) < 6) continue;
    out.push({
      pos: [x, 0.17, z],
      scale: 0.6 + rand() * 0.8,
      dark: rand() > 0.55,
    });
  }
  return out;
}
