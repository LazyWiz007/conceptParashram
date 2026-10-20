"use client";

import { useMemo, useState } from "react";
import { SLOTS, SLOTS_BY_ID } from "@/content/slots";
import { athlete, DRAFT, race } from "@/content/site";
import { useSlotViews, useTrackSlotView } from "@/lib/useLive";
import type { ViewId } from "@/lib/types";
import { Chamber } from "./suit/Chamber";
import { SuitStage } from "./suit/SuitStage";
import { SlotCard } from "./panels/SlotCard";
import { SlotList } from "./panels/SlotList";
import { ActivityTicker } from "./panels/ActivityTicker";
import { Countdown } from "./panels/Countdown";

export function Studio() {
  const [view, setView] = useState<ViewId>("front");
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);

  const views = useSlotViews();
  useTrackSlotView(focusedId);

  const focused = focusedId ? SLOTS_BY_ID.get(focusedId) ?? null : null;
  const openCount = useMemo(() => SLOTS.filter((s) => s.status === "open").length, []);

  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      <Chamber />

      <div className="absolute inset-0 px-4 pb-[clamp(3.5rem,10svh,5rem)] pt-[clamp(6rem,27svh,13.5rem)] sm:pb-16 sm:pt-10">
        <SuitStage
          slots={SLOTS}
          view={view}
          setView={setView}
          focusedId={focusedId}
          setFocusedId={setFocusedId}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
        />
      </div>

      {/* keeps the headline legible over the suit on short screens */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[clamp(7rem,32svh,14rem)] bg-gradient-to-b from-[rgb(3_7_13/0.92)] via-[rgb(3_7_13/0.55)] to-transparent sm:h-40 sm:from-[rgb(3_7_13/0.75)]"
        aria-hidden
      />

      {/* top-left: the pitch */}
      <header
        className={`pointer-events-none absolute left-4 right-4 top-4 z-20 max-w-[min(22rem,78vw)] sm:right-auto transition-opacity duration-300 sm:left-6 sm:top-6 ${
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
        <p className="mt-2 max-w-[30ch] text-sm leading-relaxed text-[var(--ink-dim)] [@media(max-height:620px)]:hidden">
          {openCount} places on the suit I will race {race.name} in. Pick one, put your
          logo on it, and come with me for the whole thing.
        </p>
        <div className="mt-3">
          <Countdown iso={race.date} compactLayout />
        </div>
      </header>

      {/* bottom-left: live proof */}
      <div className="absolute bottom-4 left-4 z-20 sm:bottom-6 sm:left-6">
        <ActivityTicker />
      </div>

      {/* bottom-right: who is asking */}
      <a
        href={athlete.instagram}
        target="_blank"
        rel="noreferrer"
        className={`absolute bottom-4 right-4 z-20 font-mono text-[11px] text-[var(--ink-faint)] transition hover:text-[var(--ink)] sm:bottom-6 sm:right-6 ${
          focusedId ? "opacity-0 sm:opacity-100" : ""
        }`}
      >
        {athlete.handle} ↗
      </a>

      {/* top-right: open the full list */}
      <button
        onClick={() => setListOpen(true)}
        className="absolute right-4 top-4 z-20 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-dim)] backdrop-blur transition hover:border-[var(--line-strong)] hover:text-[var(--ink)] sm:right-6 sm:top-6"
      >
        Every slot
      </button>

      <SlotCard slot={focused} views={views[focusedId ?? ""]} onClose={() => setFocusedId(null)} />

      <SlotList
        open={listOpen}
        views={views}
        onPick={(slot) => {
          setListOpen(false);
          setView(slot.bestView);
          setFocusedId(slot.id);
        }}
        onClose={() => setListOpen(false)}
      />

      {/* scroll affordance */}
      <div
        className={`pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-faint)] transition-opacity duration-300 ${
          focusedId || listOpen ? "opacity-0" : "opacity-60"
        }`}
      >
        scroll ↓
      </div>
    </section>
  );
}
