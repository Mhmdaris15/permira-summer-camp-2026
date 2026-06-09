/**
 * Zone — clickable, hover-aware, focus-aware patch + label.
 *
 *   • hover  → patch lifts + label scales (local state)
 *   • click  → fires sceneState.inspect(zone.id) — InfoPanel opens,
 *              camera animates in via CameraController
 *   • active → emissive lifts and a pulsing halo ring appears
 *   • other zones dim slightly when something else is being inspected,
 *     so the eye lands on the active zone immediately
 */
import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS, type Zone as ZoneDef } from "./layout";
import { Label } from "./Label";
import { useSceneState } from "./sceneState";

export function Zone({ zone }: { zone: ZoneDef }) {
  const [x, z] = zone.position;
  const [w, d] = zone.size;
  const [hovered, setHovered] = useState(false);

  const { inspectedId, inspect, setHover } = useSceneState();
  const isActive = inspectedId === zone.id;
  const isDimmed = inspectedId !== null && !isActive;

  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const haloRef = useRef<THREE.Mesh>(null);

  useFrame((state, dt) => {
    const lambda = 8;

    // Lift on hover or active
    const lift = (isActive ? 0.12 : 0) + (hovered ? 0.05 : 0);
    if (groupRef.current) {
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, lift, lambda, dt);
    }

    // Patch emissive — active glows brightest, hover medium, base 0
    if (matRef.current) {
      const target = isActive ? 0.32 : hovered ? 0.18 : 0;
      const opacityTarget = isDimmed ? 0.45 : 0.92;
      matRef.current.emissiveIntensity = THREE.MathUtils.damp(matRef.current.emissiveIntensity, target, 6, dt);
      matRef.current.opacity = THREE.MathUtils.damp(matRef.current.opacity, opacityTarget, 5, dt);
    }

    // Active halo ring pulses
    if (haloRef.current) {
      const haloMat = haloRef.current.material as THREE.MeshBasicMaterial;
      if (isActive) {
        const pulse = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.15;
        haloMat.opacity = THREE.MathUtils.damp(haloMat.opacity, pulse, 5, dt);
        const scale = 1.05 + Math.sin(state.clock.elapsedTime * 3) * 0.04;
        haloRef.current.scale.setScalar(scale);
      } else {
        haloMat.opacity = THREE.MathUtils.damp(haloMat.opacity, 0, 8, dt);
      }
    }
  });

  function onOver(e: ThreeEvent<PointerEvent>) {
    e.stopPropagation();
    setHovered(true);
    setHover(zone.id);
    document.body.style.cursor = "pointer";
  }
  function onOut() {
    setHovered(false);
    setHover(null);
    document.body.style.cursor = "";
  }
  function onClick(e: ThreeEvent<MouseEvent>) {
    e.stopPropagation();
    inspect(zone.id);
  }

  return (
    <group ref={groupRef} position={[x, 0, z]} onPointerOver={onOver} onPointerOut={onOut} onClick={onClick}>
      {/* Pulsing halo — only visible while active */}
      <mesh ref={haloRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[Math.max(w, d) * 0.55, Math.max(w, d) * 0.7, 48]} />
        <meshBasicMaterial color={COLORS[zone.color]} transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Halo plane (soft fill) */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <planeGeometry args={[w + 0.8, d + 0.8]} />
        <meshStandardMaterial color={COLORS[zone.color]} transparent opacity={0.18} roughness={1} />
      </mesh>

      {/* Main patch */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial
          ref={matRef}
          color={COLORS[zone.color]}
          emissive={COLORS[zone.color]}
          emissiveIntensity={0}
          transparent
          opacity={0.92}
          roughness={0.9}
        />
      </mesh>

      <EdgeRing width={w} depth={d} />

      <Label position={[0, 2.6, 0]} variant="primary" highlighted={hovered || isActive}>
        {zone.label}
      </Label>
    </group>
  );
}

function EdgeRing({ width, depth }: { width: number; depth: number }) {
  const t = 0.06;
  const y = 0.1;
  const color = "#2c130b";
  return (
    <group>
      <mesh position={[0, y,  depth / 2]}>
        <boxGeometry args={[width, 0.08, t]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[0, y, -depth / 2]}>
        <boxGeometry args={[width, 0.08, t]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[ width / 2, y, 0]}>
        <boxGeometry args={[t, 0.08, depth]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      <mesh position={[-width / 2, y, 0]}>
        <boxGeometry args={[t, 0.08, depth]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  );
}
