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
  // DecalGeometry stretches UVs 0..1 across the projector's width and height,
  // so the canvas must have exactly the print's proportions or everything
  // drawn on it — a logo included — comes out squashed. Only the pixel count
  // is capped, never the aspect.
  const [w, h] = slot.anchor.size;
  const aspect = w / h;
  const cw = Math.max(16, aspect >= 1 ? PX : Math.round(PX * aspect));
  const ch = Math.max(16, aspect >= 1 ? Math.round(PX / aspect) : PX);

  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d")!;

  // A logo with no brand colour is printed on its own: no sticker, no border,
  // its transparency kept, fitted inside the print at its own aspect ratio.
  // That is how a visitor's uploaded preview is drawn.
  if (slot.status !== "open" && logo && !slot.sponsor?.color) {
    const margin = Math.round(Math.min(cw, ch) * 0.04);
    drawContained(
      ctx,
      logo,
      { x: margin, y: margin, w: cw - margin * 2, h: ch - margin * 2 },
      slot.sponsor?.logoTurn ?? 0,
    );
    return finish(canvas);
  }

  const taken = slot.status !== "open";
  const brand = taken ? slot.sponsor?.color ?? SOLD_HEX : TIER_HEX[slot.tier];
  const pad = Math.round(Math.min(cw, ch) * 0.06);
  const radius = Math.min(cw, ch) * 0.14;

  ctx.clearRect(0, 0, cw, ch);

  // fill
  roundRect(ctx, pad, pad, cw - pad * 2, ch - pad * 2, radius);
  // nearly opaque, or the paler tier colours vanish against the white top of
  // the suit
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
    drawContained(
      ctx,
      logo,
      { x: pad * 2.2, y: pad * 2.2, w: cw - pad * 4.4, h: ch - pad * 4.4 },
      slot.sponsor?.logoTurn ?? 0,
    );
  } else if (taken) {
    label(ctx, cw, ch, slot.sponsor?.name ?? "Sponsored", "#0a0a0a");
  } else {
    label(ctx, cw, ch, "YOUR LOGO", "#0a0a0a");
  }

  return finish(canvas);
}

function finish(canvas: HTMLCanvasElement): SlotArt {
  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return { texture, dispose: () => texture.dispose() };
}

/**
 * Draws an image as large as fits inside `box`, centred, never stretched.
 * `turn` rotates it clockwise about the box centre first; a quarter turn swaps
 * which side of the box constrains the fit, so the logo fills the long axis.
 */
function drawContained(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  box: { x: number; y: number; w: number; h: number },
  turn = 0,
) {
  // an SVG with no width/height attributes loads at 0×0; give it a shape
  const iw = img.naturalWidth || img.width || 300;
  const ih = img.naturalHeight || img.height || 150;

  if (!turn) {
    const scale = Math.min(box.w / iw, box.h / ih);
    ctx.drawImage(img, box.x + (box.w - iw * scale) / 2, box.y + (box.h - ih * scale) / 2, iw * scale, ih * scale);
    return;
  }

  const quarter = Math.abs(turn % 180) === 90;
  const bw = quarter ? box.h : box.w;
  const bh = quarter ? box.w : box.h;
  const scale = Math.min(bw / iw, bh / ih);

  ctx.save();
  ctx.translate(box.x + box.w / 2, box.y + box.h / 2);
  ctx.rotate((turn * Math.PI) / 180);
  ctx.drawImage(img, (-iw * scale) / 2, (-ih * scale) / 2, iw * scale, ih * scale);
  ctx.restore();
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
