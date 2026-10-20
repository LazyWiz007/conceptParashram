"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { DecalGeometry } from "three-stdlib";
import { SOLD_HEX, TIER_HEX } from "@/lib/tierColors";
import type { TierId } from "@/lib/types";

/**
 * Projects a slot onto whatever geometry is underneath it. DecalGeometry clips
 * the target's triangles against a projector box, so it needs no UV layout at
 * all — which is what makes it safe on a generated mesh whose UVs are a mess.
 */
export function SlotDecal3D({
  target,
  position,
  rotation,
  size,
  tier,
  taken = false,
  active = false,
  opacity = 1,
  map,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  target: THREE.Mesh | null;
  position: [number, number, number];
  rotation: [number, number, number];
  size: [number, number, number];
  tier: TierId;
  taken?: boolean;
  active?: boolean;
  opacity?: number;
  map?: THREE.Texture;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  onClick?: () => void;
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

  const hex = taken ? SOLD_HEX : TIER_HEX[tier];

  return (
    <mesh
      geometry={geometry}
      renderOrder={2}
      onPointerOver={
        onPointerOver
          ? (e) => {
              e.stopPropagation();
              document.body.style.cursor = "pointer";
              onPointerOver();
            }
          : undefined
      }
      onPointerOut={
        onPointerOut
          ? () => {
              document.body.style.cursor = "";
              onPointerOut();
            }
          : undefined
      }
      onClick={
        onClick
          ? (e) => {
              e.stopPropagation();
              onClick();
            }
          : undefined
      }
    >
      <meshStandardMaterial
        map={map}
        color={hex}
        emissive={hex}
        emissiveIntensity={active ? 0.75 : 0.22}
        transparent
        opacity={opacity}
        depthTest
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-12}
        roughness={0.65}
        metalness={0}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}
