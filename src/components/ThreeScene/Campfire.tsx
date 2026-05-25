/**
 * Campfire — stone ring, crossed logs, and a flame cone that gently
 * flickers via emissive intensity + tiny scale wobble. The motion is
 * intentionally subtle so it stays "alive but not distracting".
 */
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { COLORS, CAMPFIRE_POSITION } from "./layout";

export function Campfire() {
  const flameRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const glowRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const flicker = 0.85 + Math.sin(t * 6) * 0.12 + Math.sin(t * 11) * 0.05;
    if (flameRef.current) {
      flameRef.current.scale.set(1 + (flicker - 1) * 0.4, flicker, 1 + (flicker - 1) * 0.4);
    }
    if (matRef.current) matRef.current.emissiveIntensity = 0.55 + (flicker - 1) * 0.6;
    if (glowRef.current) glowRef.current.intensity = 1.4 + (flicker - 1) * 0.8;
  });

  const [x, z] = CAMPFIRE_POSITION;
  return (
    <group position={[x, 0, z]}>
      {/* Stone ring */}
      <mesh receiveShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[1.25, 1.45, 0.16, 18]} />
        <meshStandardMaterial color="#8a7f6e" roughness={1} flatShading />
      </mesh>
      {/* Stone pebbles around the ring */}
      {[...Array(8)].map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <mesh
            key={i}
            castShadow
            position={[Math.cos(a) * 1.4, 0.16, Math.sin(a) * 1.4]}
            rotation={[0, a, 0]}
          >
            <icosahedronGeometry args={[0.18, 0]} />
            <meshStandardMaterial color={i % 2 ? "#9c9690" : "#7a7570"} roughness={1} flatShading />
          </mesh>
        );
      })}
      {/* Crossed logs */}
      <mesh castShadow position={[0, 0.3, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.14, 0.14, 1.8, 8]} />
        <meshStandardMaterial color={COLORS.trunk} roughness={0.9} flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.45, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 1.8, 8]} />
        <meshStandardMaterial color={COLORS.trunk} roughness={0.9} flatShading />
      </mesh>
      {/* Flame cone */}
      <mesh ref={flameRef} castShadow position={[0, 0.95, 0]}>
        <coneGeometry args={[0.55, 1.0, 6]} />
        <meshStandardMaterial
          ref={matRef}
          color={COLORS.fireGlow}
          emissive="#ff8a3a"
          emissiveIntensity={0.55}
          roughness={0.3}
          flatShading
        />
      </mesh>
      {/* Inner flame core */}
      <mesh position={[0, 0.65, 0]}>
        <coneGeometry args={[0.28, 0.55, 6]} />
        <meshStandardMaterial color="#ffe9a8" emissive="#ffe9a8" emissiveIntensity={0.6} />
      </mesh>
      {/* Tiny point light — local warmth on nearby surfaces */}
      <pointLight ref={glowRef} position={[0, 1.0, 0]} color="#ffae5c" intensity={1.4} distance={6} decay={2} />
    </group>
  );
}
