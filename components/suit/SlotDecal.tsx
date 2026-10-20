"use client";

import Image from "next/image";
import { quadToMatrix3d } from "@/lib/geometry";
import type { Quad, Slot } from "@/lib/types";

/** Base box the homography maps from. Bigger = crisper logo raster. */
const BOX = 240;

/** Slots printed on the black bib panels need a screen blend, not multiply. */
export const DARK_PANEL = new Set([
  "thigh_left",
  "thigh_right",
  "thigh_rear_left",
  "thigh_rear_right",
]);

export function SlotDecal({
  slot,
  quad,
  width,
  height,
  dimmed,
  active,
}: {
  slot: Slot;
  quad: Quad;
  width: number;
  height: number;
  dimmed: boolean;
  active: boolean;
}) {
  if (!width || !height) return null;

  const px: Quad = [
    [quad[0][0] * width, quad[0][1] * height],
    [quad[1][0] * width, quad[1][1] * height],
    [quad[2][0] * width, quad[2][1] * height],
    [quad[3][0] * width, quad[3][1] * height],
  ];

  const onDark = DARK_PANEL.has(slot.id);
  const tier = `var(--tier-${slot.tier})`;
  const taken = slot.status !== "open";

  return (
    <div
      className={`decal ${onDark ? "decal--dark" : ""}`}
      style={{
        width: BOX,
        height: BOX,
        transform: quadToMatrix3d(px, BOX, BOX),
        opacity: dimmed ? 0.18 : 1,
        transition: "opacity 260ms ease",
      }}
      aria-hidden
    >
      {taken && slot.sponsor?.logo ? (
        <Image
          src={slot.sponsor.logo}
          alt=""
          width={BOX}
          height={BOX}
          className="decal-art"
          unoptimized
        />
      ) : (
        <div
          className="h-full w-full"
          style={{
            background: `repeating-linear-gradient(135deg,
              color-mix(in srgb, ${tier} ${onDark ? 30 : 46}%, transparent) 0 14px,
              color-mix(in srgb, ${tier} ${onDark ? 18 : 30}%, transparent) 14px 28px)`,
            border: `6px ${taken ? "solid" : "dashed"} color-mix(in srgb, ${tier} ${active ? 100 : 72}%, transparent)`,
            borderRadius: 10,
            transition: "border-color 240ms ease",
          }}
        />
      )}
    </div>
  );
}
