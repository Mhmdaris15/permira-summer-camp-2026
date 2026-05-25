/**
 * Scene — top-level R3F canvas composing every visual layer:
 *
 *   • atmospheric background + fog  (sense of air)
 *   • hemisphere + warm directional lighting
 *   • soft contact shadow under the central campsite area
 *   • terrain → paths → zones → tents → trees → props → focal points
 *   • sky cloud puffs + interactive orbit controls with damping
 *
 * Everything reads positions from `layout.ts`. Animation lives only in
 * Campfire and Sky — both subtle.
 */
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, OrbitControls, ContactShadows } from "@react-three/drei";

import {
  COLORS,
  PATHS,
  TENT_CLUSTERS,
  TERRAIN,
  TREES,
  ZONES,
} from "./layout";
import { Terrain } from "./Terrain";
import { Path } from "./Path";
import { Zone } from "./Zone";
import { Tent } from "./Tent";
import { Tree } from "./Tree";
import { Campfire } from "./Campfire";
import { CommitteePost } from "./CommitteePost";
import { AssemblyMarker } from "./AssemblyMarker";
import { NorthIndicator } from "./NorthIndicator";
import { EntryArrow } from "./EntryArrow";
import { Lighting } from "./Lighting";
import { Sky } from "./Sky";
import { Props } from "./Props";

export function Scene() {
  // Slightly off-axis to feel intentional, not orthogonal-perfect.
  const cameraZoom = 23;

  return (
    <Canvas
      shadows
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Atmospheric sky background + warm fog give the scene "air". */}
      <color attach="background" args={["#dceaf6"]} />
      <fog attach="fog" args={["#dceaf6", 38, 95]} />

      {/* Cinematic isometric camera, very slightly off-axis */}
      <OrthographicCamera
        makeDefault
        position={[26, 22, 30]}
        zoom={cameraZoom}
        near={-200}
        far={200}
      />
      <OrbitControls
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.08}
        enablePan
        enableRotate
        enableZoom
        minZoom={15}
        maxZoom={48}
        // Restrict awkward angles — never go below the horizon, never top-down.
        minPolarAngle={Math.PI / 5.5}
        maxPolarAngle={Math.PI / 2.4}
        makeDefault
      />

      <Lighting />

      {/* Far backdrop — sky puffs */}
      <Sky />

      {/* Ground + scene contents */}
      <Terrain />

      {PATHS.map((p) => (
        <Path key={p.id} path={p} />
      ))}

      {ZONES.map((z) => (
        <Zone key={z.id} zone={z} />
      ))}

      {/* Tent clusters */}
      {TENT_CLUSTERS.map((cluster) => {
        const xs = Array.from({ length: cluster.cols }, (_, i) => i - (cluster.cols - 1) / 2);
        const zs = Array.from({ length: cluster.rows }, (_, i) => i - (cluster.rows - 1) / 2);
        return (
          <group key={cluster.id}>
            {zs.map((zMul) =>
              xs.map((xMul) => {
                const x = cluster.origin[0] + xMul * cluster.spacing[0];
                const z = cluster.origin[1] + zMul * cluster.spacing[1];
                return (
                  <Tent
                    key={`${cluster.id}-${xMul}-${zMul}`}
                    position={[x, 0.05, z]}
                    color={COLORS[cluster.color]}
                    rotationY={cluster.rotationY ?? 0}
                  />
                );
              }),
            )}
          </group>
        );
      })}

      {TREES.map(([x, z, scale, variant], i) => (
        <Tree key={i} position={[x, 0, z]} scale={scale} variant={variant} />
      ))}

      <Props />
      <Campfire />
      <CommitteePost />
      <AssemblyMarker />

      <NorthIndicator />
      <EntryArrow position={[-19, 2]} rotationY={0} label="Entrance" />
      <EntryArrow position={[ 19, 4]} rotationY={0} label="Exit" />

      {/* Soft contact shadow grounding every casting object onto the lawn */}
      <ContactShadows
        position={[0, 0.18, 0]}
        opacity={0.55}
        scale={TERRAIN.width + 4}
        blur={2.6}
        far={6}
        resolution={1024}
        color="#3a2a18"
      />
    </Canvas>
  );
}
