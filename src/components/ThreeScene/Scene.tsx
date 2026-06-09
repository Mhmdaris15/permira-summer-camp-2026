/**
 * Scene — composition root for the campsite. Three architectural layers:
 *
 *   ENVIRONMENT  — what the world IS  (sky, terrain, trees, props, kit)
 *   STORY        — what HAPPENS here  (zones, tents, focal architecture)
 *   WAYFINDING   — how visitors NAVIGATE  (paths, signs, north, arrows)
 *
 * Camera + focus animations live in CameraController (drives both the
 * intro fly-in and the click-to-focus). Interactivity flows through
 * SceneStateProvider mounted in LayoutProposal.tsx so HTML overlays
 * (InfoPanel, hints, reset button) share the same store.
 */
import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrthographicCamera, OrbitControls, ContactShadows } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

import { COLORS, PATHS, TENT_CLUSTERS, TERRAIN, TREES, ZONES } from "./layout";

// Environment
import { Terrain } from "./Terrain";
import { Sky } from "./Sky";
import { SkyDome } from "./SkyDome";
import { Tree } from "./Tree";
import { Props } from "./Props";
import { Lighting } from "./Lighting";
import { VillageProps } from "./VillageProps";
import { SafeGroup } from "./SafeGroup";

// Story
import { Zone } from "./Zone";
import { Tent } from "./Tent";
import { Campfire } from "./Campfire";
import { CommitteePost } from "./CommitteePost";
import { AssemblyMarker } from "./AssemblyMarker";
import { StringLights } from "./StringLights";

// Wayfinding
import { Path } from "./Path";
import { NorthIndicator } from "./NorthIndicator";
import { EntryArrow } from "./EntryArrow";
import { EntranceSign } from "./EntranceSign";

// Systems
import { CameraController } from "./CameraController";

const CAMERA_POSITION: [number, number, number] = [26, 22, 30];
const CAMERA_ZOOM = 23;

export function Scene() {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <Canvas
      shadows
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      dpr={[1, 2]}
      style={{ width: "100%", height: "100%" }}
    >
      <fog attach="fog" args={[COLORS.skyHorizon, 38, 105]} />

      <OrthographicCamera
        makeDefault
        position={CAMERA_POSITION}
        zoom={CAMERA_ZOOM}
        near={-200}
        far={300}
      />
      <OrbitControls
        ref={controlsRef}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.08}
        enablePan
        enableRotate
        enableZoom
        minZoom={15}
        maxZoom={48}
        minPolarAngle={Math.PI / 5.5}
        maxPolarAngle={Math.PI / 2.4}
        makeDefault
      />
      <CameraController
        controlsRef={controlsRef}
        defaultPosition={CAMERA_POSITION}
        defaultZoom={CAMERA_ZOOM}
      />

      <Lighting />

      {/* ─────────── ENVIRONMENT ─────────── */}
      <group name="environment">
        <SkyDome />
        <Sky />
        <Terrain />
        {TREES.map(([x, z, scale, variant], i) => (
          <Tree key={i} position={[x, 0, z]} scale={scale} variant={variant} />
        ))}
        <Props />
        {/* GLB assets — Suspense + error boundary. If anything in here
            fails (texture 404, parse error, missing buffer) the rest of
            the scene still renders. */}
        <SafeGroup name="village-props">
          <Suspense fallback={null}>
            <VillageProps />
          </Suspense>
        </SafeGroup>
      </group>

      {/* ─────────── STORY ─────────── */}
      <group name="story">
        {ZONES.map((z) => (
          <Zone key={z.id} zone={z} />
        ))}

        {TENT_CLUSTERS.map((cluster) => {
          const xs = Array.from({ length: cluster.cols }, (_, i) => i - (cluster.cols - 1) / 2);
          const zs = Array.from({ length: cluster.rows }, (_, i) => i - (cluster.rows - 1) / 2);
          return (
            <group key={cluster.id}>
              {zs.map((zMul) =>
                xs.map((xMul) => {
                  const x = cluster.origin[0] + xMul * cluster.spacing[0];
                  const z = cluster.origin[1] + zMul * cluster.spacing[1];
                  const seed = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453);
                  const jitter = seed - Math.floor(seed);
                  const useAlt = cluster.colorAlt && (xMul + zMul) % 2 === 1;
                  const color = useAlt && cluster.colorAlt ? COLORS[cluster.colorAlt] : COLORS[cluster.color];
                  return (
                    <Tent
                      key={`${cluster.id}-${xMul}-${zMul}`}
                      position={[x, 0.05, z]}
                      color={color}
                      scale={0.92 + jitter * 0.16}
                      rotationY={(cluster.rotationY ?? 0) + (jitter - 0.5) * 0.35}
                    />
                  );
                }),
              )}
            </group>
          );
        })}

        <Campfire />
        <CommitteePost />
        <AssemblyMarker />
        <StringLights />
      </group>

      {/* ─────────── WAYFINDING ─────────── */}
      <group name="wayfinding">
        {PATHS.map((p) => (
          <Path key={p.id} path={p} />
        ))}
        <NorthIndicator />
        <EntranceSign />
        <EntryArrow position={[-19, 2]} rotationY={0} label="Entrance" />
        <EntryArrow position={[ 19, 4]} rotationY={0} label="Exit" />
      </group>

      <ContactShadows
        position={[0, 0.18, 0]}
        opacity={0.5}
        scale={TERRAIN.width + 4}
        blur={2.8}
        far={6}
        resolution={1024}
        color="#3a2a18"
      />
    </Canvas>
  );
}
