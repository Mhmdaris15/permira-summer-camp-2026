/**
 * VillageProps — curated placement of Medieval Village MegaKit assets.
 * Currently:
 *   • Wooden fences along the entrance + exit corridors
 *   • One wagon at the cooking & dining area
 *   • Two crates flanking the wagon
 *
 * Add new placements here. Position/rotation/scale are in world units.
 */
import { KitProp, KIT_ASSETS } from "./KitProp";

// Scale tuned by eye — kit ships at ~1m units, we want each fence panel
// to read at ~1.4 units wide in our world. Adjust here if it looks off.
const FENCE_SCALE = 1.6;
const FENCE_Y = 0;

/** Hand-placed fence runs (X, Z, rotationY in radians). */
const FENCES: Array<[number, number, number]> = [
  // Entrance corridor — south side
  [-21,  3.6, 0],
  [-19,  3.6, 0],
  [-17,  3.6, 0],
  [-15,  3.6, 0],
  // Entrance corridor — north side
  [-21,  0.4, 0],
  [-19,  0.4, 0],
  [-17,  0.4, 0],
  // Exit corridor — south side
  [ 14,  5.6, 0],
  [ 16,  5.6, 0],
  [ 18,  5.6, 0],
  [ 20,  5.6, 0],
  // Exit corridor — north side
  [ 14,  2.4, 0],
  [ 16,  2.4, 0],
  [ 18,  2.4, 0],
  [ 20,  2.4, 0],
];

export function VillageProps() {
  return (
    <group>
      {/* Fence runs — alternate the three variants to break uniformity */}
      {FENCES.map(([x, z, rotY], i) => {
        const url =
          i % 3 === 0 ? KIT_ASSETS.fenceSingle :
          i % 3 === 1 ? KIT_ASSETS.fenceExt1   :
                        KIT_ASSETS.fenceExt2;
        return (
          <KitProp
            key={i}
            url={url}
            position={[x, FENCE_Y, z]}
            rotationY={rotY}
            scale={FENCE_SCALE}
          />
        );
      })}

      {/* Wagon at cooking area edge */}
      <KitProp
        url={KIT_ASSETS.wagon}
        position={[18.5, 0, -4.5]}
        rotationY={-Math.PI / 6}
        scale={1.4}
      />

      {/* Crates flanking the wagon */}
      <KitProp url={KIT_ASSETS.crate} position={[18, 0, -3]}    rotationY={ 0.3} scale={1.1} />
      <KitProp url={KIT_ASSETS.crate} position={[19.6, 0, -6]}  rotationY={-0.4} scale={1.0} />
      <KitProp url={KIT_ASSETS.crate} position={[17.4, 0.6, -2.7]} rotationY={0.1} scale={0.9} />
    </group>
  );
}
