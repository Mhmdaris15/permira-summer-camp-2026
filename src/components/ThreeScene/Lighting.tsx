/**
 * Cinematic three-light rig for stylized low-poly scenes.
 *
 *   • hemisphereLight  — sky-blue from above, warm grass green from below
 *   • directionalLight — warm late-afternoon sun, casts the only shadows
 *   • ambientLight     — tiny fill to lift the deepest shadows
 *
 * Tuned for a bright daytime mood with enough contrast to read silhouettes.
 */
import { TERRAIN } from "./layout";

export function Lighting() {
  return (
    <>
      <hemisphereLight
        args={[/* sky */ "#bfe1ff", /* ground */ "#caa66f", 0.85]}
      />
      <ambientLight intensity={0.18} color="#fff1d6" />
      <directionalLight
        castShadow
        position={[22, 34, 14]}
        intensity={1.25}
        color="#ffe1b3"
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-TERRAIN.width / 2 - 4}
        shadow-camera-right={TERRAIN.width / 2 + 4}
        shadow-camera-top={TERRAIN.depth / 2 + 4}
        shadow-camera-bottom={-TERRAIN.depth / 2 - 4}
        shadow-camera-near={1}
        shadow-camera-far={120}
        shadow-bias={-0.0004}
        shadow-normalBias={0.04}
      />
    </>
  );
}
