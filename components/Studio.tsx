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

function Chevron({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 14"
      className={`absolute left-0 h-3.5 w-6 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l9 8 9-8" />
    </svg>
  );
}

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

  function scrollToDetails() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("race")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }

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
        className="pointer-events-none absolute inset-x-0 top-0 z-10 h-[clamp(7rem,32svh,13rem)] bg-gradient-to-b from-[rgb(5_5_6/0.92)] via-[rgb(5_5_6/0.5)] to-transparent sm:h-40 sm:from-[rgb(5_5_6/0.7)]"
        aria-hidden
      />

      <header
        className={`pointer-events-none absolute left-4 right-4 top-4 z-20 max-w-[min(22rem,78vw)] transition-opacity duration-300 sm:left-6 sm:right-auto sm:top-6 ${
          focusedId ? "opacity-0" : "opacity-100"
        }`}
      >
        {DRAFT && (
          <span className="pointer-events-auto mb-2 inline-block rounded-full border border-[rgb(255_212_0/0.4)] bg-[rgb(255_212_0/0.1)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--accent)]">
            Draft content
          </span>
        )}
        <h1 className="text-balance text-2xl font-semibold leading-[1.1] tracking-tight sm:text-[2rem]">
          Sponsor my trisuit
        </h1>
        <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--accent)]">
          {athlete.name} · {athlete.title}
        </p>
        <p className="mt-2 max-w-[30ch] text-sm leading-relaxed text-[var(--ink-dim)] [@media(max-height:620px)]:hidden">
          {openCount} places on the suit I will race {race.name} in. Spin it, pick one, put your
          logo on it.
        </p>
        {race.dateConfirmed && (
          <div className="mt-3">
            <Countdown iso={race.date} compactLayout />
          </div>
        )}
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

      {/*
        On a phone the canvas swallows every swipe to spin the suit, so the
        page cannot be scrolled from here at all — this button is the way out.
        It sits above the ticker and badge on small screens, between them on
        larger ones.
      */}
      <div
        className={`absolute bottom-[6.5rem] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 transition-opacity duration-300 sm:bottom-5 ${
          focusedId || listOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <span className="pointer-events-none font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-faint)]">
          drag to spin
        </span>
        <button
          onClick={scrollToDetails}
          aria-label="Scroll down to the race details"
          className="grid h-16 w-16 place-items-center rounded-full border-2 border-[var(--accent)] bg-[var(--panel)] text-[var(--accent)] shadow-[0_0_28px_rgb(255_212_0/0.35)] backdrop-blur transition hover:bg-[rgb(255_212_0/0.12)] active:scale-95 sm:h-14 sm:w-14"
        >
          <span className="relative block h-7 w-6" aria-hidden>
            <Chevron className="scroll-chevron top-0" />
            <Chevron className="scroll-chevron scroll-chevron-late top-2.5" />
          </span>
        </button>
      </div>
    </section>
  );
}
