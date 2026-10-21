"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { DecalGeometry } from "three-stdlib";
import { drawSlotArt, loadLogo } from "@/lib/slotTexture";
import type { Slot } from "@/lib/types";

/**
 * Projects a slot onto whatever geometry is underneath it. DecalGeometry clips
 * the target's triangles against a projector box, so it needs no UV layout at
 * all — which is what makes it safe on a generated mesh whose UVs are a mess.
 */
export function SlotDecal3D({
  target,
  slot,
  active = false,
  dimmed = false,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  target: THREE.Mesh | null;
  slot: Slot;
  active?: boolean;
  dimmed?: boolean;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  onClick?: () => void;
}) {
  const { position, rotation, size } = slot.anchor;

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

  const [logo, setLogo] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    let alive = true;
    loadLogo(slot.sponsor?.logo).then((img) => alive && setLogo(img));
    return () => {
      alive = false;
    };
  }, [slot.sponsor?.logo]);

  const art = useMemo(() => drawSlotArt(slot, logo, active), [slot, logo, active]);
  useEffect(() => art.dispose, [art]);

  useEffect(() => () => geometry?.dispose(), [geometry]);

  if (!geometry) return null;

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
        map={art.texture}
        transparent
        opacity={dimmed ? 0.3 : 1}
        emissive="#ffffff"
        emissiveMap={art.texture}
        emissiveIntensity={active ? 0.6 : 0.32}
        depthTest
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-12}
        roughness={0.7}
        metalness={0}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}
