/**
 * Path — chains a series of [x, z] waypoints into individual ground
 * rectangles that meet at the bends. Centre dashes are emitted along
 * each segment so curved paths still read as one walkway.
 *
 * The result feels less "site-plan-diagram" and more "trodden footpath"
 * even with simple primitives.
 */
import { COLORS, type Path as PathDef } from "./layout";

export function Path({ path }: { path: PathDef }) {
  const segments = [];
  for (let i = 0; i < path.points.length - 1; i++) {
    segments.push(
      <Segment
        key={i}
        from={path.points[i]}
        to={path.points[i + 1]}
        width={path.width}
      />,
    );
  }
  return <group>{segments}</group>;
}

function Segment({
  from,
  to,
  width,
}: {
  from: [number, number];
  to: [number, number];
  width: number;
}) {
  const [x1, z1] = from;
  const [x2, z2] = to;
  const dx = x2 - x1;
  const dz = z2 - z1;
  const length = Math.hypot(dx, dz);
  const angle = Math.atan2(dz, dx);
  const centre: [number, number, number] = [(x1 + x2) / 2, 0.04, (z1 + z2) / 2];

  const dashCount = Math.max(2, Math.floor(length / 1.4));
  const dashLength = length / (dashCount * 2 - 1);
  const dashWidth = Math.min(0.18, width * 0.16);

  return (
    <group position={centre} rotation={[-Math.PI / 2, 0, -angle]}>
      {/* Base */}
      <mesh receiveShadow>
        <planeGeometry args={[length + 0.4, width]} />
        <meshStandardMaterial color={COLORS.path} roughness={0.95} />
      </mesh>

      {/* Inner highlight — slightly lighter centre line gives the path
          subtle dimension without a normal map. */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[length, width * 0.55]} />
        <meshStandardMaterial color={"#efd9af"} roughness={0.95} />
      </mesh>

      {/* Dashed centre marks */}
      {Array.from({ length: dashCount }).map((_, i) => {
        const t = (i * 2) / (dashCount * 2 - 1);
        const x = -length / 2 + t * length + dashLength / 2;
        return (
          <mesh key={i} position={[x, 0.002, 0]}>
            <planeGeometry args={[dashLength, dashWidth]} />
            <meshStandardMaterial color={COLORS.pathStripe} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
}
