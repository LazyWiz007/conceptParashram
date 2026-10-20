"use client";

import { quadCentroid } from "@/lib/geometry";
import { inr } from "@/lib/format";
import type { Quad, Slot } from "@/lib/types";

/** The floating dot + label that sits over a slot and takes the click. */
export function SlotMarker({
  slot,
  quad,
  active,
  dimmed,
  counterScale,
  showLabel,
  onEnter,
  onLeave,
  onSelect,
}: {
  slot: Slot;
  quad: Quad;
  active: boolean;
  dimmed: boolean;
  /** Undoes the stage zoom so dots and labels keep a constant screen size. */
  counterScale: number;
  showLabel: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onSelect: () => void;
}) {
  const [cx, cy] = quadCentroid(quad);
  const tier = `var(--tier-${slot.tier})`;
  const taken = slot.status !== "open";

  return (
    <button
      type="button"
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onSelect}
      aria-label={`${slot.label} — ${taken ? `taken by ${slot.sponsor?.name}` : `available, ${inr(slot.price)}`}`}
      className="absolute z-10 grid -translate-x-1/2 -translate-y-1/2 place-items-center outline-none"
      style={{
        left: `${cx * 100}%`,
        top: `${cy * 100}%`,
        opacity: dimmed ? 0.25 : 1,
        transition: "opacity 240ms ease",
      }}
    >
      <span
        className="relative grid place-items-center"
        style={{ scale: String(counterScale), transition: "scale 240ms ease" }}
      >
        <span className="relative grid h-7 w-7 place-items-center">
        {!taken && (
          <span
            className="pulse-ring absolute inset-0 rounded-full"
            style={{ boxShadow: `0 0 0 2px color-mix(in srgb, ${tier} 70%, transparent)` }}
          />
        )}
        <span
          className="relative h-2.5 w-2.5 rounded-full transition-transform duration-200"
          style={{
            background: taken ? "var(--sold)" : tier,
            boxShadow: `0 0 0 2px rgb(3 7 13 / 0.75), 0 0 14px color-mix(in srgb, ${tier} 70%, transparent)`,
            transform: active ? "scale(1.5)" : "scale(1)",
          }}
        />
      </span>

      <span
        className="pointer-events-none absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md border border-[var(--line)] bg-[var(--panel)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] backdrop-blur transition-all duration-200"
        style={{
          opacity: active && showLabel ? 1 : 0,
          transform: `translate(-50%, ${active ? "0" : "-4px"})`,
          color: taken ? "var(--ink-dim)" : "var(--ink)",
        }}
      >
        {slot.label}
        <span className="ml-2" style={{ color: taken ? "var(--sold)" : tier }}>
          {taken ? "taken" : inr(slot.price)}
        </span>
      </span>
      </span>
    </button>
  );
}
