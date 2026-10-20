"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";

/**
 * TEMPORARY stand-in so the scene, the controls and the decal projection can be
 * built and tested before the real trisuit GLB arrives. Delete this file the
 * moment `public/models/trisuit.glb` exists.
 */
export function MannequinStandIn({
  onReady,
}: {
  onReady?: (meshes: THREE.Mesh[]) => void;
}) {
  const jersey = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#eef2f6", roughness: 0.62, metalness: 0.05 }),
    [],
  );
  const bibs = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#0d1117", roughness: 0.5, metalness: 0.15 }),
    [],
  );

  const limb = (
    key: string,
    pos: [number, number, number],
    rot: [number, number, number],
    r: number,
    len: number,
    mat: THREE.Material,
  ) => (
    <mesh key={key} position={pos} rotation={rot} material={mat} castShadow>
      <capsuleGeometry args={[r, len, 6, 18]} />
    </mesh>
  );

  const root = useRef<THREE.Group>(null);

  // Collect the meshes once, after mount. Doing this in a ref callback instead
  // re-fires on every render and loops setState until the canvas dies.
  useEffect(() => {
    if (!root.current || !onReady) return;
    const meshes: THREE.Mesh[] = [];
    root.current.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
    });
    onReady(meshes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <group position={[0, -0.35, 0]} ref={root}>
      {/* torso */}
      <mesh position={[0, 0.62, 0]} material={jersey}>
        <capsuleGeometry args={[0.40, 0.72, 8, 28]} />
      </mesh>
      {/* shoulders */}
      <mesh position={[0, 1.02, 0]} material={jersey}>
        <sphereGeometry args={[0.42, 24, 18]} />
      </mesh>
      {/* hips / bibs */}
      <mesh position={[0, 0.02, 0]} material={bibs}>
        <capsuleGeometry args={[0.36, 0.30, 8, 24]} />
      </mesh>

      {limb("ua-l", [-0.52, 0.80, 0], [0, 0, 0.26], 0.125, 0.42, jersey)}
      {limb("ua-r", [0.52, 0.80, 0], [0, 0, -0.26], 0.125, 0.42, jersey)}
      {limb("fa-l", [-0.68, 0.30, 0.02], [0, 0, 0.16], 0.105, 0.42, jersey)}
      {limb("fa-r", [0.68, 0.30, 0.02], [0, 0, -0.16], 0.105, 0.42, jersey)}

      {limb("th-l", [-0.20, -0.52, 0], [0, 0, 0.05], 0.175, 0.52, bibs)}
      {limb("th-r", [0.20, -0.52, 0], [0, 0, -0.05], 0.175, 0.52, bibs)}
      {limb("cf-l", [-0.22, -1.22, 0], [0, 0, 0.02], 0.13, 0.50, bibs)}
      {limb("cf-r", [0.22, -1.22, 0], [0, 0, -0.02], 0.13, 0.50, bibs)}
    </group>
  );
}
