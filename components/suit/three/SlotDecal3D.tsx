"use client";

import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { DecalGeometry } from "three-stdlib";
import { drawSlotArt, loadLogo } from "@/lib/slotTexture";
import type { Slot } from "@/lib/types";

/** Multiplies a printed logo's colours; white artwork ends up a soft off-white. */
const PRINT_TONE = "#c8c8c8";

const skipRaycast = () => {};

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
  hidden = false,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  target: THREE.Mesh | null;
  slot: Slot;
  active?: boolean;
  dimmed?: boolean;
  /**
   * Out of sight and out of reach of the pointer, but still mounted. Building
   * the geometry means clipping the whole suit mesh, so a decal that will be
   * shown again is hidden rather than unmounted and rebuilt.
   */
  hidden?: boolean;
  onPointerOver?: () => void;
  onPointerOut?: () => void;
  onClick?: () => void;
}) {
  const { position, rotation, size } = slot.anchor;

  // three still raycasts invisible meshes, so a hidden decal opts out of
  // hit-testing too, or it would steal hovers and clicks from the suit
  const raycast = hidden ? skipRaycast : THREE.Mesh.prototype.raycast;

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
      visible={!hidden}
      raycast={raycast}
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
              if (e.delta > 2) return; // end of an orbit drag, not a click
              onClick();
            }
          : undefined
      }
    >
      {slot.status === "open" ? (
        // an empty slot glows, so the stickers for sale catch the eye
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
      ) : (
        // A sponsor's logo is printed, not lit: unlit, no glow, and toned a
        // little under white so the bloom pass does not flare it out
        <meshBasicMaterial
          map={art.texture}
          color={PRINT_TONE}
          transparent
          opacity={dimmed ? 0.3 : 1}
          depthTest
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-12}
          side={THREE.FrontSide}
        />
      )}
    </mesh>
  );
}
