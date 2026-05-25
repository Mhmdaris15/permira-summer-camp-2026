/**
 * Low-poly tent — small floor pad, 4-sided pyramid body, a darker tip cap,
 * a ridge pole, and a tiny entrance awning. Still ~6 meshes total.
 */
type Props = {
  position?: [number, number, number];
  color: string;
  scale?: number;
  rotationY?: number;
};

export function Tent({ position = [0, 0, 0], color, scale = 1, rotationY = 0 }: Props) {
  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      {/* Floor pad — slightly inset so shadow grounds it */}
      <mesh receiveShadow position={[0, 0.03, 0]}>
        <boxGeometry args={[1.7, 0.06, 1.5]} />
        <meshStandardMaterial color="#e8d4a8" roughness={0.95} />
      </mesh>

      {/* Main body — a 4-sided pyramid via cone(radius, h, 4) rotated 45° */}
      <mesh castShadow position={[0, 0.78, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.15, 1.45, 4]} />
        <meshStandardMaterial color={color} roughness={0.85} flatShading />
      </mesh>

      {/* Darker shadow tip (top 25%) — adds depth and silhouette read */}
      <mesh position={[0, 1.42, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.35, 0.42, 4]} />
        <meshStandardMaterial color="#3a2010" roughness={0.9} />
      </mesh>

      {/* Ridge pole peeking from the top */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.4, 6]} />
        <meshStandardMaterial color="#5a3a1a" />
      </mesh>

      {/* Entrance awning — wedge over the door */}
      <mesh
        castShadow
        position={[0, 0.6, 0.86]}
        rotation={[-0.5, 0, 0]}
      >
        <boxGeometry args={[0.7, 0.04, 0.45]} />
        <meshStandardMaterial color="#c79a6a" roughness={0.9} />
      </mesh>

      {/* Door slit */}
      <mesh position={[0, 0.3, 0.72]}>
        <planeGeometry args={[0.28, 0.5]} />
        <meshStandardMaterial color="#2c130b" />
      </mesh>
    </group>
  );
}
