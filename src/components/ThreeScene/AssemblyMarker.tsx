/**
 * Assembly Point marker — a flat white "H" painted on the blue assembly
 * patch, so the zone reads as a muster point at a glance.
 */
import { COLORS, ZONES } from "./layout";

export function AssemblyMarker() {
  const zone = ZONES.find((z) => z.id === "assembly");
  if (!zone) return null;
  const [x, z] = zone.position;
  return (
    <group position={[x, 0.06, z]}>
      {/* Two vertical bars */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.9, 0, 0]}>
        <planeGeometry args={[0.45, 2.2]} />
        <meshStandardMaterial color={COLORS.assemblyMark} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.9, 0, 0]}>
        <planeGeometry args={[0.45, 2.2]} />
        <meshStandardMaterial color={COLORS.assemblyMark} />
      </mesh>
      {/* Crossbar */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.0, 0.45]} />
        <meshStandardMaterial color={COLORS.assemblyMark} />
      </mesh>
    </group>
  );
}
