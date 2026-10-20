"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { DecalGeometry } from "three-stdlib";

/**
 * Projects a slot onto whatever geometry is underneath it. DecalGeometry works
 * by clipping the target's triangles against a projector box, so it needs no
 * UV layout at all — which is what makes it safe to use on an AI-generated
 * mesh whose UVs are usually a mess.
 */
export function SlotDecal3D({
  target,
  position,
  rotation,
  size,
  map,
  color,
  opacity = 1,
  polygonOffsetFactor = -12,
}: {
  target: THREE.Mesh | null;
  position: [number, number, number];
  /** Euler. Z spins the decal in its own plane; X/Y aim the projector. */
  rotation: [number, number, number];
  /** Projector box: [width, height, depth]. Depth must cross the surface. */
  size: [number, number, number];
  map?: THREE.Texture;
  color?: string;
  opacity?: number;
  polygonOffsetFactor?: number;
}) {
  const geometry = useMemo(() => {
    if (!target) return null;
    try {
      return new DecalGeometry(
        target,
        new THREE.Vector3(...position),
        new THREE.Euler(...rotation),
        new THREE.Vector3(...size),
      );
    } catch {
      // projector missed the mesh entirely — nothing to draw
      return null;
    }
  }, [target, position, rotation, size]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} renderOrder={2}>
      <meshStandardMaterial
        map={map}
        color={color ?? "#ffffff"}
        transparent
        opacity={opacity}
        depthTest
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={polygonOffsetFactor}
        roughness={0.7}
        metalness={0}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}
