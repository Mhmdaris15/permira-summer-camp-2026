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
  // Along the pier → kitchen spine (north edge)
  [-11, -5.2, 0],
  [ -9, -5.2, 0],
  [ -7, -5.2, 0],
  // Screening the Organisers' Post approach
  [  7, -7.2, 0],
  [  9, -7.2, 0],
  [ 11, -7.2, 0],
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

      {/* Supply wagon at the Open Kitchen edge */}
      <KitProp
        url={KIT_ASSETS.wagon}
        position={[1.5, 0, -6]}
        rotationY={-Math.PI / 6}
        scale={1.4}
      />

      {/* Crates flanking the wagon */}
      <KitProp url={KIT_ASSETS.crate} position={[0, 0, -6.5]}    rotationY={ 0.3} scale={1.1} />
      <KitProp url={KIT_ASSETS.crate} position={[2.6, 0, -4.8]}  rotationY={-0.4} scale={1.0} />
      <KitProp url={KIT_ASSETS.crate} position={[-0.6, 0.6, -6.3]} rotationY={0.1} scale={0.9} />
    </group>
  );
}
