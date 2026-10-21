"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { athlete, DRAFT, race } from "@/content/site";
import type { Slot } from "@/lib/types";
import { cameraForAnchor } from "@/lib/slotCamera";
import { useSlotViews, useTrackSlotView } from "@/lib/useLive";
import { HOME, type CameraMove } from "@/components/suit/three/CameraRig";
import { CanvasBoundary } from "@/components/suit/three/CanvasBoundary";
import { SlotCard } from "./panels/SlotCard";
import { SlotList } from "./panels/SlotList";
import { ActivityTicker } from "./panels/ActivityTicker";
import { Countdown } from "./panels/Countdown";
import { AthleteBadge } from "./panels/AthleteBadge";

// WebGL has no business in the server bundle, and the chamber is heavy enough
// that the copy should paint first.
const Stage3D = dynamic(() => import("@/components/suit/three/Stage3D").then((m) => m.Stage3D), {
  ssr: false,
});

export function Studio({ slots, avatar }: { slots: Slot[]; avatar?: string | null }) {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [move, setMove] = useState<CameraMove | null>(null);

  const views = useSlotViews();
  useTrackSlotView(focusedId);

  const byId = useMemo(() => new Map(slots.map((s) => [s.id, s])), [slots]);
  const focused = focusedId ? byId.get(focusedId) ?? null : null;
  const openCount = useMemo(() => slots.filter((s) => s.status === "open").length, [slots]);

  function select(id: string) {
    const slot = byId.get(id);
    if (!slot) return;
    if (focusedId === id) return close();
    setFocusedId(id);
    setMove(cameraForAnchor(slot.anchor));
  }

  function close() {
    setFocusedId(null);
    setMove(HOME);
  }

  const hovered = hoveredId ? byId.get(hoveredId) : null;

  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <CanvasBoundary>
          <Stage3D
            slots={slots}
            move={move}
            focusedId={focusedId}
            hoveredId={hoveredId}
            onHover={setHoveredId}
            onSelect={select}
            onBackgroundClick={close}
            video={athlete.video}
          />
        </CanvasBoundary>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[clamp(7rem,32svh,13rem)] bg-gradient-to-b from-[rgb(3_7_13/0.92)] via-[rgb(3_7_13/0.5)] to-transparent sm:h-40 sm:from-[rgb(3_7_13/0.7)]"
        aria-hidden
      />

      <header
        className={`pointer-events-none absolute left-4 right-4 top-4 z-20 max-w-[min(22rem,78vw)] transition-opacity duration-300 sm:left-6 sm:right-auto sm:top-6 ${
          focusedId ? "opacity-0" : "opacity-100"
        }`}
      >
        {DRAFT && (
          <span className="pointer-events-auto mb-2 inline-block rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-amber-300">
            Draft content
          </span>
        )}
        <h1 className="text-balance text-2xl font-semibold leading-[1.1] tracking-tight sm:text-[2rem]">
          Sponsor my trisuit
        </h1>
        <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--tier-prime)]">
          {athlete.name} · {athlete.title}
        </p>
        <p className="mt-2 max-w-[30ch] text-sm leading-relaxed text-[var(--ink-dim)] [@media(max-height:620px)]:hidden">
          {openCount} places on the suit I will race {race.name} in. Spin it, pick one, put your
          logo on it.
        </p>
        <div className="mt-3">
          <Countdown iso={race.date} compactLayout />
        </div>
      </header>

      {/* hover readout, so the suit explains itself before anything is clicked */}
      <div
        className={`pointer-events-none absolute left-1/2 top-5 z-20 -translate-x-1/2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] backdrop-blur transition-opacity duration-200 ${
          hovered && !focusedId ? "opacity-100" : "opacity-0"
        }`}
      >
        {hovered?.label}
        {hovered && (
          <span className="ml-2" style={{ color: `var(--tier-${hovered.tier})` }}>
            {hovered.status === "open" ? "available" : "taken"}
          </span>
        )}
      </div>

      <div className="absolute bottom-4 left-4 z-20 sm:bottom-6 sm:left-6">
        <ActivityTicker />
      </div>

      <div className="absolute bottom-4 right-4 z-20 max-w-[calc(100vw-2rem)] sm:bottom-6 sm:right-6">
        <AthleteBadge avatar={avatar} />
      </div>

      <button
        onClick={() => setListOpen(true)}
        className="absolute right-4 top-4 z-20 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-dim)] backdrop-blur transition hover:border-[var(--line-strong)] hover:text-[var(--ink)] sm:right-6 sm:top-6"
      >
        Every slot
      </button>

      <SlotCard slot={focused} views={views[focusedId ?? ""]} onClose={close} />

      <SlotList
        slots={slots}
        open={listOpen}
        views={views}
        onPick={(slot) => {
          setListOpen(false);
          select(slot.id);
        }}
        onClose={() => setListOpen(false)}
      />

      <div
        className={`pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-faint)] transition-opacity duration-300 ${
          focusedId || listOpen ? "opacity-0" : "opacity-60"
        }`}
      >
        drag to spin · scroll ↓
      </div>
    </section>
  );
}
