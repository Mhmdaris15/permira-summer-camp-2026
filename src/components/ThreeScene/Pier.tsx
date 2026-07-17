/**
 * Pier — a short wooden jetty reaching off the west shore into the water.
 * The camp sits on the Vyborg Bay shore of Cape Kiperort, so the pier by the
 * water is the camp's front door (the coach drops off nearby).
 */
import { COLORS, ZONES } from "./layout";

const PLANK = "#8a5a34";
const PLANK_DARK = "#6f4526";

export function Pier() {
  const zone = ZONES.find((z) => z.id === "pier");
  if (!zone) return null;
  const [x, z] = zone.position;

  // Deck runs westward (−X) off the shore, out over the water.
  const planks = Array.from({ length: 6 }, (_, i) => -0.5 - i * 1.05);

  return (
    <group position={[x, 0, z]}>
      {/* Deck boards */}
      {planks.map((px, i) => (
        <mesh key={i} castShadow receiveShadow position={[px, 0.14, 0]}>
          <boxGeometry args={[0.9, 0.14, 3.2]} />
          <meshStandardMaterial color={i % 2 ? PLANK_DARK : PLANK} roughness={0.95} flatShading />
        </mesh>
      ))}

      {/* Support posts at the far end, dipping into the water */}
      {[-6.0, -6.0, -0.5, -0.5].map((px, i) => {
        const pz = i % 2 === 0 ? 1.4 : -1.4;
        return (
          <mesh key={`post-${i}`} castShadow position={[px, -0.15, pz]}>
            <cylinderGeometry args={[0.12, 0.12, 1.2, 8]} />
            <meshStandardMaterial color={PLANK_DARK} roughness={1} />
          </mesh>
        );
      })}

      {/* A moored rowboat alongside the deck */}
      <group position={[-5.4, 0.1, 2.4]} rotation={[0, 0.25, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.4, 0.4, 0.9]} />
          <meshStandardMaterial color={COLORS.pier} roughness={0.9} flatShading />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <boxGeometry args={[2.0, 0.12, 0.6]} />
          <meshStandardMaterial color={PLANK} roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}
