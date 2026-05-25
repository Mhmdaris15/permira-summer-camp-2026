/**
 * Low-poly tree — cylinder trunk + two stacked icosahedron blobs for
 * foliage (more organic than cones), with a soft drop shadow disc and
 * a deterministic random rotation per position.
 */
import { COLORS } from "./layout";

type Props = {
  position?: [number, number, number];
  scale?: number;
  variant?: 0 | 1;
};

export function Tree({ position = [0, 0, 0], scale = 1, variant = 0 }: Props) {
  const leafColor = variant === 0 ? COLORS.tree : COLORS.treeDark;
  // Deterministic rotation based on position so every render is identical.
  const rot = (position[0] * 0.31 + position[2] * 0.17) % (Math.PI * 2);

  return (
    <group position={position} rotation={[0, rot, 0]} scale={scale}>
      {/* Drop shadow disc — visually grounds the tree even where directional shadow is faint */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.9, 16]} />
        <meshStandardMaterial color="#000000" transparent opacity={0.12} />
      </mesh>

      {/* Trunk */}
      <mesh castShadow position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.18, 0.26, 1.3, 8]} />
        <meshStandardMaterial color={COLORS.trunk} roughness={0.95} flatShading />
      </mesh>

      {/* Foliage — two soft blobs */}
      <mesh castShadow position={[0, 1.7, 0]}>
        <icosahedronGeometry args={[0.95, 0]} />
        <meshStandardMaterial color={leafColor} roughness={1} flatShading />
      </mesh>
      <mesh castShadow position={[0.15, 2.35, -0.1]}>
        <icosahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial
          color={variant === 0 ? "#69a04a" : "#558a3a"}
          roughness={1}
          flatShading
        />
      </mesh>
    </group>
  );
}
