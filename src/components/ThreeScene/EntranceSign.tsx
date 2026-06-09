/**
 * EntranceSign — a small wooden plank on a post at the entrance.
 * Acts as a visual gateway and reinforces the wayfinding story.
 */
import { COLORS, ENTRANCE_SIGN_POSITION } from "./layout";
import { Label } from "./Label";

export function EntranceSign() {
  const [x, z] = ENTRANCE_SIGN_POSITION;
  return (
    <group position={[x, 0, z]}>
      {/* Post */}
      <mesh castShadow position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 2.4, 8]} />
        <meshStandardMaterial color={COLORS.committeePost} roughness={0.9} />
      </mesh>
      {/* Plank — angled slightly toward camera */}
      <mesh castShadow position={[0.6, 1.9, 0]} rotation={[0, 0.18, 0]}>
        <boxGeometry args={[1.8, 0.55, 0.08]} />
        <meshStandardMaterial color={COLORS.postWall} roughness={0.95} flatShading />
      </mesh>
      {/* Plank inner border — adds detail without textures */}
      <mesh position={[0.6, 1.9, 0.045]} rotation={[0, 0.18, 0]}>
        <planeGeometry args={[1.55, 0.36]} />
        <meshStandardMaterial color={"#e0c39a"} roughness={0.95} />
      </mesh>
      {/* Two nails */}
      <mesh position={[-0.18, 2.1, 0.05]} rotation={[0, 0.18, 0]}>
        <circleGeometry args={[0.04, 8]} />
        <meshStandardMaterial color={"#3a2010"} />
      </mesh>
      <mesh position={[ 1.32, 2.1, 0.05]} rotation={[0, 0.18, 0]}>
        <circleGeometry args={[0.04, 8]} />
        <meshStandardMaterial color={"#3a2010"} />
      </mesh>

      {/* Floating label hovering above */}
      <Label position={[0.6, 3.3, 0]} variant="arrow">Welcome</Label>
    </group>
  );
}
