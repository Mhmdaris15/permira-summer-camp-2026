/**
 * SkyDome — a large inverted icosphere with per-vertex gradient colours,
 * producing a soft warm-horizon → cool-zenith atmosphere without any
 * custom shader work. Drawn on the BackSide so we see the inside surface.
 *
 * Three colour stops:
 *   COLORS.skyTop      — zenith (cool blue)
 *   COLORS.skyMid      — mid-air (light blue)
 *   COLORS.skyHorizon  — horizon haze (warm cream)
 *
 * The gradient is interpolated by vertex Y position, giving a clean
 * three-band sky that reads as late afternoon.
 */
import { useMemo } from "react";
import * as THREE from "three";
import { COLORS } from "./layout";

const DOME_RADIUS = 120;

export function SkyDome() {
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(DOME_RADIUS, 3);
    const pos = geo.attributes.position;
    const count = pos.count;
    const colors = new Float32Array(count * 3);

    const top = new THREE.Color(COLORS.skyTop);
    const mid = new THREE.Color(COLORS.skyMid);
    const horizon = new THREE.Color(COLORS.skyHorizon);

    for (let i = 0; i < count; i++) {
      const y = pos.getY(i);
      // Normalize Y from -1..1 across the sphere
      const t = THREE.MathUtils.clamp((y + DOME_RADIUS * 0.4) / (DOME_RADIUS * 1.4), 0, 1);
      let c: THREE.Color;
      if (t < 0.45) {
        // horizon → mid
        const u = t / 0.45;
        c = horizon.clone().lerp(mid, smoothstep(u));
      } else {
        // mid → top
        const u = (t - 0.45) / 0.55;
        c = mid.clone().lerp(top, smoothstep(u));
      }
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} renderOrder={-1}>
      <meshBasicMaterial
        vertexColors
        side={THREE.BackSide}
        fog={false}
        depthWrite={false}
      />
    </mesh>
  );
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}
