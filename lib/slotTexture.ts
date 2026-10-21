import * as THREE from "three";
import { SOLD_HEX, TIER_HEX } from "./tierColors";
import type { Slot } from "./types";

/**
 * Builds a slot's decal artwork on a 2D canvas.
 *
 * DecalGeometry lays UVs 0..1 across the projector box, so a canvas texture
 * maps onto the print exactly. Drawing it here rather than shipping flat
 * colours is what buys the rounded corners, the dashed "available" border and
 * the sponsor's own brand colour behind their logo.
 */
const PX = 512;

export type SlotArt = { texture: THREE.CanvasTexture; dispose: () => void };

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

export function drawSlotArt(
  slot: Slot,
  logo: HTMLImageElement | null,
  selected: boolean,
): SlotArt {
  // keep the artwork's pixels square-ish to the real print, so a wide band
  // does not stretch its logo
  const [w, h] = slot.anchor.size;
  const aspect = Math.max(0.25, Math.min(4, w / h));
  const cw = aspect >= 1 ? PX : Math.round(PX * aspect);
  const ch = aspect >= 1 ? Math.round(PX / aspect) : PX;

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d")!;

  const taken = slot.status !== "open";
  const brand = taken ? slot.sponsor?.color ?? SOLD_HEX : TIER_HEX[slot.tier];
  const pad = Math.round(Math.min(cw, ch) * 0.06);
  const radius = Math.min(cw, ch) * 0.14;

  ctx.clearRect(0, 0, cw, ch);

  // fill
  roundRect(ctx, pad, pad, cw - pad * 2, ch - pad * 2, radius);
  // the tiers are all shades of yellow, so the fill stays nearly opaque or the
  // paler ones would vanish against the white top of the suit
  ctx.fillStyle = taken ? brand : hexWithAlpha(brand, 0.88);
  ctx.fill();

  // border: dashed while the slot is still for sale, solid once taken. Black,
  // because a white line disappears on yellow and on the white fabric alike.
  ctx.save();
  roundRect(ctx, pad, pad, cw - pad * 2, ch - pad * 2, radius);
  ctx.lineWidth = Math.max(4, Math.min(cw, ch) * (selected ? 0.05 : 0.026));
  ctx.strokeStyle = taken && !selected ? hexWithAlpha("#0a0a0a", 0.5) : "#0a0a0a";
  if (!taken && !selected) ctx.setLineDash([Math.min(cw, ch) * 0.07, Math.min(cw, ch) * 0.05]);
  ctx.stroke();
  ctx.restore();

  if (taken && logo) {
    // contain the logo inside the print with a comfortable margin
    const box = { x: pad * 2.2, y: pad * 2.2, w: cw - pad * 4.4, h: ch - pad * 4.4 };
    const scale = Math.min(box.w / logo.width, box.h / logo.height);
    const lw = logo.width * scale;
    const lh = logo.height * scale;
    ctx.drawImage(logo, box.x + (box.w - lw) / 2, box.y + (box.h - lh) / 2, lw, lh);
  } else if (taken) {
    label(ctx, cw, ch, slot.sponsor?.name ?? "Sponsored", "#0a0a0a");
  } else {
    label(ctx, cw, ch, "YOUR LOGO", "#0a0a0a");
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return { texture, dispose: () => texture.dispose() };
}

function label(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  text: string,
  color: string,
) {
  const size = Math.min(cw, ch) * 0.2;
  ctx.fillStyle = color;
  ctx.font = `700 ${size}px ui-sans-serif, system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const words = text.split(" ");
  const lines = words.length > 1 && cw / ch < 2 ? words : [text];
  lines.forEach((ln, i) => {
    ctx.fillText(ln, cw / 2, ch / 2 + (i - (lines.length - 1) / 2) * size * 1.15, cw * 0.78);
  });
}

function hexWithAlpha(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Loads a logo once; resolves null rather than throwing on a bad path. */
export function loadLogo(src: string | null | undefined): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
