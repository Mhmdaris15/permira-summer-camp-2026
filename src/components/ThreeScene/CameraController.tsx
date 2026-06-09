/**
 * CameraController — coordinates the camera + OrbitControls in response
 * to scene state. Handles three jobs:
 *
 *   1. Intro fly-in   (mount)
 *   2. Focus animation when a zone is inspected
 *   3. Smooth reset when the inspection is cleared
 *
 * All motion runs through `THREE.MathUtils.damp` for framerate-independent
 * smoothing. While transitioning the controls are temporarily disabled so
 * the user's drag doesn't fight the animation.
 */
import { useEffect, useRef, type RefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ZONES } from "./layout";
import { useSceneState } from "./sceneState";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

type Props = {
  controlsRef: RefObject<OrbitControlsImpl | null>;
  defaultPosition: [number, number, number];
  defaultZoom: number;
};

const FOCUS_ZOOM = 38;
const FOCUS_OFFSET = new THREE.Vector3(11, 11, 11); // from zone centre to camera

export function CameraController({ controlsRef, defaultPosition, defaultZoom }: Props) {
  const camera = useThree((s) => s.camera);
  const { inspectedId } = useSceneState();

  // Current animation goals — updated by effects below.
  const targetCamPos = useRef(new THREE.Vector3(...defaultPosition));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const targetZoom = useRef(defaultZoom);

  // ---- Intro: start farther & higher, settle into default frame ----
  useEffect(() => {
    camera.position.set(
      defaultPosition[0] * 1.35,
      defaultPosition[1] * 1.5 + 8,
      defaultPosition[2] * 1.35,
    );
    if ("zoom" in camera) {
      (camera as unknown as { zoom: number }).zoom = defaultZoom * 0.78;
      camera.updateProjectionMatrix();
    }
    targetCamPos.current.set(...defaultPosition);
    targetLookAt.current.set(0, 0, 0);
    targetZoom.current = defaultZoom;
    // run-once intro
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Inspect / clear: recompute goals ----
  useEffect(() => {
    if (inspectedId) {
      const zone = ZONES.find((z) => z.id === inspectedId);
      if (zone) {
        const [zx, zz] = zone.position;
        targetCamPos.current.set(zx + FOCUS_OFFSET.x, FOCUS_OFFSET.y, zz + FOCUS_OFFSET.z);
        targetLookAt.current.set(zx, 0.6, zz);
        targetZoom.current = FOCUS_ZOOM;
      }
    } else {
      targetCamPos.current.set(...defaultPosition);
      targetLookAt.current.set(0, 0, 0);
      targetZoom.current = defaultZoom;
    }
    // Pause user controls while transitioning. We re-enable when close to goal.
    const c = controlsRef.current;
    if (c) c.enabled = false;
  }, [inspectedId, defaultPosition, defaultZoom, controlsRef]);

  useFrame((_, dt) => {
    const c = controlsRef.current;
    const lambda = 4.5;

    // Camera position
    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.current.x, lambda, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.current.y, lambda, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.current.z, lambda, dt);

    // OrbitControls.target — keeps camera + controls in sync
    if (c) {
      c.target.x = THREE.MathUtils.damp(c.target.x, targetLookAt.current.x, lambda, dt);
      c.target.y = THREE.MathUtils.damp(c.target.y, targetLookAt.current.y, lambda, dt);
      c.target.z = THREE.MathUtils.damp(c.target.z, targetLookAt.current.z, lambda, dt);
      c.update();
    }

    // Orthographic zoom
    if ("zoom" in camera) {
      const cam = camera as unknown as { zoom: number; updateProjectionMatrix: () => void };
      const next = THREE.MathUtils.damp(cam.zoom, targetZoom.current, lambda, dt);
      if (Math.abs(next - cam.zoom) > 0.001) {
        cam.zoom = next;
        cam.updateProjectionMatrix();
      }
    }

    // Re-enable controls once we're effectively at the goal
    if (c && !c.enabled) {
      const posDelta = camera.position.distanceTo(targetCamPos.current);
      if (posDelta < 0.4) c.enabled = true;
    }
  });

  return null;
}
