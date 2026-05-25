/**
 * Compass-style north indicator — a base disc + a bicolour arrow pointing
 * along -Z (which we treat as "North"). Anchored at the corner of the map.
 */
import { COLORS, NORTH_INDICATOR_POSITION } from "./layout";
import { Label } from "./Label";

export function NorthIndicator() {
  const [x, z] = NORTH_INDICATOR_POSITION;
  return (
    <group position={[x, 0.07, z]}>
      {/* Base disc */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.5, 32]} />
        <meshStandardMaterial color="#fdf8f1" />
      </mesh>
      {/* North arrow — long red half */}
      <mesh position={[0, 0.05, -0.6]}>
        <coneGeometry args={[0.4, 1.2, 3]} />
        <meshStandardMaterial color={COLORS.northNeedle} />
      </mesh>
      {/* South arrow — short grey half */}
      <mesh rotation={[0, 0, Math.PI]} position={[0, 0.05, 0.4]}>
        <coneGeometry args={[0.32, 0.8, 3]} />
        <meshStandardMaterial color="#5a3a1a" />
      </mesh>
      <Label position={[0, 1.4, -1.6]} variant="small">N</Label>
    </group>
  );
}
