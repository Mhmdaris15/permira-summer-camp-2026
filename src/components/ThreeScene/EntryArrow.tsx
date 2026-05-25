/**
 * EntryArrow — flat arrow on the ground pointing into/out of the camp.
 * Built from a rectangle (shaft) + triangle (head) so it reads from above.
 */
import { COLORS } from "./layout";
import { Label } from "./Label";

type Props = {
  position: [number, number];
  /** Direction the arrow points in radians around Y (0 = +X / east). */
  rotationY: number;
  label: "Entrance" | "Exit";
};

export function EntryArrow({ position, rotationY, label }: Props) {
  const [x, z] = position;
  const color = label === "Entrance" ? COLORS.arrowIn : COLORS.arrowOut;
  return (
    <group position={[x, 0.07, z]} rotation={[0, rotationY, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.2, 0.7]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, Math.PI / 2]} position={[1.9, 0, 0]}>
        <coneGeometry args={[0.9, 1.2, 3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Label position={[0, 1.6, 0]} variant="arrow">{label}</Label>
    </group>
  );
}
