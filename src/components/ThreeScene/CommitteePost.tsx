/**
 * CommitteePost — a small wooden lodge with a pitched roof, two windows,
 * a porch step, and a flag pole. Reads as the "headquarters" focal point
 * from above.
 */
import { COLORS, ZONES } from "./layout";

export function CommitteePost() {
  const zone = ZONES.find((z) => z.id === "committee-post");
  if (!zone) return null;
  const [x, z] = zone.position;
  return (
    <group position={[x, 0, z]}>
      {/* Porch step */}
      <mesh receiveShadow castShadow position={[0, 0.08, 1.4]}>
        <boxGeometry args={[1.6, 0.16, 0.5]} />
        <meshStandardMaterial color="#c79a6a" roughness={0.95} />
      </mesh>

      {/* Walls */}
      <mesh castShadow receiveShadow position={[0, 0.85, 0]}>
        <boxGeometry args={[2.4, 1.6, 2.4]} />
        <meshStandardMaterial color="#dcb88a" roughness={0.85} flatShading />
      </mesh>

      {/* Roof */}
      <mesh castShadow position={[0, 2.0, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.05, 1.0, 4]} />
        <meshStandardMaterial color={COLORS.postRoof} roughness={0.85} flatShading />
      </mesh>

      {/* Roof darker rim */}
      <mesh position={[0, 1.62, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[2.05, 2.05, 0.12, 4]} />
        <meshStandardMaterial color="#3a1c10" roughness={1} flatShading />
      </mesh>

      {/* Front door */}
      <mesh position={[0, 0.55, 1.21]}>
        <planeGeometry args={[0.55, 1.0]} />
        <meshStandardMaterial color="#2c130b" />
      </mesh>

      {/* Door knob */}
      <mesh position={[0.18, 0.55, 1.215]}>
        <sphereGeometry args={[0.04, 6, 6]} />
        <meshStandardMaterial color="#f5b942" />
      </mesh>

      {/* Windows */}
      <Window position={[-0.75, 1.0, 1.21]} />
      <Window position={[ 0.75, 1.0, 1.21]} />
      <Window position={[ 1.21, 1.0,  0]} rotationY={Math.PI / 2} />
      <Window position={[-1.21, 1.0,  0]} rotationY={Math.PI / 2} />

      {/* Flag pole */}
      <mesh castShadow position={[1.35, 1.9, 1.1]}>
        <cylinderGeometry args={[0.04, 0.04, 1.9, 6]} />
        <meshStandardMaterial color="#2c130b" />
      </mesh>
      <mesh position={[1.62, 2.4, 1.1]}>
        <planeGeometry args={[0.6, 0.36]} />
        <meshStandardMaterial color={COLORS.committeeTent} side={2} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Window({
  position,
  rotationY = 0,
}: {
  position: [number, number, number];
  rotationY?: number;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh>
        <planeGeometry args={[0.5, 0.4]} />
        <meshStandardMaterial color="#bfe1ff" emissive="#bfe1ff" emissiveIntensity={0.15} />
      </mesh>
      {/* Frame cross */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[0.5, 0.04]} />
        <meshStandardMaterial color="#3a2010" />
      </mesh>
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[0.04, 0.4]} />
        <meshStandardMaterial color="#3a2010" />
      </mesh>
    </group>
  );
}
