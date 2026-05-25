/**
 * Zone — a coloured ground patch with a subtle elevated edge and a
 * floating label. The patch sits very slightly above terrain (0.04 → 0.06)
 * to avoid z-fighting, with a darker bevel ring giving each area its own
 * read at any zoom.
 */
import { COLORS, type Zone as ZoneDef } from "./layout";
import { Label } from "./Label";

export function Zone({ zone }: { zone: ZoneDef }) {
  const [x, z] = zone.position;
  const [w, d] = zone.size;
  return (
    <group position={[x, 0, z]}>
      {/* Soft outer halo — very faint expansion of the zone color */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[w + 0.8, d + 0.8]} />
        <meshStandardMaterial
          color={COLORS[zone.color]}
          transparent
          opacity={0.18}
          roughness={1}
        />
      </mesh>

      {/* Main patch */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial
          color={COLORS[zone.color]}
          transparent
          opacity={0.92}
          roughness={0.9}
        />
      </mesh>

      {/* Bevel ring — slim raised border for architectural read */}
      <EdgeRing width={w} depth={d} />

      {/* Floating label */}
      <Label position={[0, 2.6, 0]} variant="primary">
        {zone.label}
      </Label>
    </group>
  );
}

function EdgeRing({ width, depth }: { width: number; depth: number }) {
  const t = 0.06;
  const y = 0.1;
  const color = "#2c130b";
  return (
    <group>
      <mesh position={[0, y,  depth / 2]}>
        <boxGeometry args={[width, 0.08, t]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, y, -depth / 2]}>
        <boxGeometry args={[width, 0.08, t]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[ width / 2, y, 0]}>
        <boxGeometry args={[t, 0.08, depth]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[-width / 2, y, 0]}>
        <boxGeometry args={[t, 0.08, depth]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  );
}
