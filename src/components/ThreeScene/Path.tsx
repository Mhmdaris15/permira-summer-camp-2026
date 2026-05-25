/**
 * Path — a sand-coloured rectangle on the ground, with a faint dashed
 * centre line. Built from a base plane + child plane so dashed art is a
 * single texture-less geometry.
 */
import { COLORS, type Path as PathDef } from "./layout";

export function Path({ path }: { path: PathDef }) {
  const [x1, z1] = path.from;
  const [x2, z2] = path.to;
  const dx = x2 - x1;
  const dz = z2 - z1;
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(dz, dx);
  const centre: [number, number, number] = [(x1 + x2) / 2, 0.04, (z1 + z2) / 2];

  // Build dashed centre line from a series of small planes.
  const dashCount = Math.max(2, Math.floor(length / 1.4));
  const dashLength = length / (dashCount * 2 - 1);

  return (
    <group position={centre} rotation={[-Math.PI / 2, 0, -angle]}>
      {/* Base */}
      <mesh receiveShadow>
        <planeGeometry args={[length, path.width]} />
        <meshStandardMaterial color={COLORS.path} roughness={0.95} />
      </mesh>
      {/* Outer outline — slightly darker rim */}
      <mesh position={[0, 0, 0.001]}>
        <ringGeometry args={[0, 0, 1, 1]} />
        <meshStandardMaterial visible={false} />
      </mesh>
      {/* Dashes */}
      {Array.from({ length: dashCount }).map((_, i) => {
        const t = (i * 2) / (dashCount * 2 - 1);
        const x = -length / 2 + t * length + dashLength / 2;
        return (
          <mesh key={i} position={[x, 0.002, 0]}>
            <planeGeometry args={[dashLength, Math.min(0.18, path.width * 0.18)]} />
            <meshStandardMaterial color={COLORS.pathStripe} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}
