/**
 * CameraIntro — fly-in animation that runs once on mount.
 *
 * Starts the camera slightly higher and farther out, then eases to the
 * final composition. Uses smoothstep for a buttery feel; no spring lib.
 *
 * Mount this *after* <OrthographicCamera makeDefault /> and *outside*
 * <OrbitControls> — once the animation completes it hands control to
 * OrbitControls naturally.
 */
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";

type Props = {
  /** Final camera position; matches what OrthographicCamera renders at rest. */
  target: [number, number, number];
  /** Final zoom; matches OrthographicCamera.zoom. */
  zoom: number;
  /** Duration in seconds. */
  duration?: number;
};

export function CameraIntro({ target, zoom, duration = 1.6 }: Props) {
  const camera = useThree((s) => s.camera);
  const elapsed = useRef(0);
  const done = useRef(false);

  // Lift the starting pose: further out + higher + zoomed-out
  const startPosition: [number, number, number] = [
    target[0] * 1.35,
    target[1] * 1.5 + 8,
    target[2] * 1.35,
  ];
  const startZoom = zoom * 0.78;

  useEffect(() => {
    camera.position.set(...startPosition);
    if ("zoom" in camera) {
      (camera as unknown as { zoom: number }).zoom = startZoom;
      camera.updateProjectionMatrix();
    }
    elapsed.current = 0;
    done.current = false;
    // intentionally only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((_, dt) => {
    if (done.current) return;
    elapsed.current += dt;
    const tRaw = Math.min(1, elapsed.current / duration);
    const t = smoothstep(tRaw);

    camera.position.set(
      lerp(startPosition[0], target[0], t),
      lerp(startPosition[1], target[1], t),
      lerp(startPosition[2], target[2], t),
    );
    if ("zoom" in camera) {
      (camera as unknown as { zoom: number }).zoom = lerp(startZoom, zoom, t);
      camera.updateProjectionMatrix();
    }

    if (tRaw >= 1) done.current = true;
  });

  return null;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}
function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}
