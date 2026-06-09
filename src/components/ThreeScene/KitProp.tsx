/**
 * KitProp — wrapper around drei's useGLTF that loads a model from the
 * Medieval Village MegaKit and renders a cloned instance, allowing the
 * same GLB to be placed many times with different transforms.
 *
 * GLTFs in this kit ship with `Standard` PBR materials; we leave them
 * intact (their warm wood tones harmonize with our palette) but force
 * castShadow / receiveShadow on the meshes so they participate in the
 * scene's lighting setup.
 */
import { useGLTF } from "@react-three/drei";
import { useMemo, useEffect } from "react";
import * as THREE from "three";

type Props = {
  url: string;
  position?: [number, number, number];
  rotationY?: number;
  scale?: number;
};

export function KitProp({ url, position = [0, 0, 0], rotationY = 0, scale = 1 }: Props) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    cloned.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        // Make sure materials respect fog and look low-poly: nudge roughness up.
        const mat = mesh.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[];
        const apply = (m: THREE.MeshStandardMaterial) => {
          if (m && "roughness" in m) m.roughness = Math.min(1, (m.roughness ?? 0.5) + 0.15);
          if (m && "metalness" in m) m.metalness = Math.max(0, (m.metalness ?? 0) - 0.1);
        };
        if (Array.isArray(mat)) mat.forEach(apply);
        else apply(mat);
      }
    });
  }, [cloned]);

  return (
    <group position={position} rotation={[0, rotationY, 0]} scale={scale}>
      <primitive object={cloned} />
    </group>
  );
}

// Curated kit at /public/kit. Each prop is now a single self-contained
// .glb (geometry + JSON packed into one binary), so the browser never
// sees a separate .bin request — only the .glb plus its external .png
// textures, which load with normal image MIME types and never trigger
// browser "Save as" prompts.
const KIT = "/kit";
export const KIT_ASSETS = {
  fenceSingle:  `${KIT}/Prop_WoodenFence_Single.glb`,
  fenceExt1:    `${KIT}/Prop_WoodenFence_Extension1.glb`,
  fenceExt2:    `${KIT}/Prop_WoodenFence_Extension2.glb`,
  wagon:        `${KIT}/Prop_Wagon.glb`,
  crate:        `${KIT}/Prop_Crate.glb`,
} as const;

// Eager preload at module load — by the time the Canvas mounts, GLBs are
// fetched and the Suspense fallback resolves almost immediately.
Object.values(KIT_ASSETS).forEach((url) => useGLTF.preload(url));
