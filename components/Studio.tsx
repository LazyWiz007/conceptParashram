"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { athlete, race } from "@/content/site";
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
import { AboutModal } from "./panels/AboutModal";

// WebGL has no business in the server bundle, and the chamber is heavy enough
// that the copy should paint first.
const Stage3D = dynamic(() => import("@/components/suit/three/Stage3D").then((m) => m.Stage3D), {
  ssr: false,
});

export function Studio({ slots, avatar }: { slots: Slot[]; avatar?: string | null }) {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [move, setMove] = useState<CameraMove | null>(null);

  const views = useSlotViews();
  useTrackSlotView(focusedId);

  const byId = useMemo(() => new Map(slots.map((s) => [s.id, s])), [slots]);
  const focused = focusedId ? byId.get(focusedId) ?? null : null;
  const openCount = useMemo(() => slots.filter((s) => s.status === "open").length, [slots]);

  /**
   * A visitor trying their own logo on one slot. The file never leaves the
   * browser: it is shown from an object URL, which is revoked as soon as the
   * preview ends or another file replaces it.
   */
  const [preview, setPreview] = useState<{ slotId: string; url: string } | null>(null);
  useEffect(() => () => {
    if (preview) URL.revokeObjectURL(preview.url);
  }, [preview]);

  /**
   * What the suit shows. Normally every slot; while previewing, only the
   * slots that are actually sold plus the one wearing the visitor's logo, so
   * they see the suit as it would really look rather than covered in
   * "YOUR LOGO" placeholders.
   *
   * The placeholders are hidden, not removed. Every decal is built by
   * clipping the whole suit mesh, and remounting sixteen of them when the
   * preview ended froze the page for over two seconds.
   */
  const shownSlots = useMemo(() => {
    if (!preview) return slots;
    return slots.map((s) =>
      s.id === preview.slotId
        ? { ...s, status: "sold" as const, sponsor: { name: "Your logo", logo: preview.url } }
        : s,
    );
  }, [slots, preview]);
  const hiddenIds = useMemo(
    () =>
      new Set(preview ? slots.filter((s) => s.status === "open" && s.id !== preview.slotId).map((s) => s.id) : []),
    [slots, preview],
  );

  function select(id: string) {
    const slot = byId.get(id);
    if (!slot) return;
    if (focusedId === id) return close();
    setPreview(null);
    setFocusedId(id);
    setMove(cameraForAnchor(slot.anchor));
  }

  function close() {
    setPreview(null);
    setFocusedId(null);
    setMove(HOME);
  }

  const hovered = hoveredId ? byId.get(hoveredId) : null;

  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <CanvasBoundary>
          <Stage3D
            slots={shownSlots}
            hiddenIds={hiddenIds}
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
        {/*
          Nearly half the official logo is dark navy, so it disappears against
          the chamber. It sits on a light chip to stay legible — which is also
          how a race mark is normally presented.
        */}
        <span className="pointer-events-auto mb-3 inline-flex rounded-lg bg-white px-3 py-2 shadow-[0_2px_18px_rgb(0_0_0/0.45)]">
          <Image
            src={race.logo}
            alt={race.name}
            width={359}
            height={248}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </span>

        <h1 className="text-balance text-2xl font-bold leading-[1.1] tracking-tight sm:text-[2rem]">
          Sponsor my trisuit
        </h1>
        <p className="mt-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
          {athlete.name} · {athlete.title}
        </p>
        <p className="mt-2 max-w-[32ch] text-sm font-medium leading-relaxed text-[var(--ink)] [@media(max-height:620px)]:hidden">
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
        <AthleteBadge avatar={avatar} onClick={() => setAboutOpen(true)} />
      </div>

      <button
        onClick={() => setListOpen(true)}
        className="absolute right-4 top-4 z-20 rounded-full border border-[var(--line)] bg-[var(--panel)] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-dim)] backdrop-blur transition hover:border-[var(--line-strong)] hover:text-[var(--ink)] sm:right-6 sm:top-6"
      >
        Every slot
      </button>

      <SlotCard
        slot={focused}
        views={views[focusedId ?? ""]}
        onClose={close}
        preview={preview && preview.slotId === focusedId ? preview.url : null}
        onPreview={(file) => focusedId && setPreview({ slotId: focusedId, url: URL.createObjectURL(file) })}
        onStopPreview={() => setPreview(null)}
      />

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

      {/* Nothing to scroll to any more — this is the way into the slots. */}
      <div
        className={`absolute bottom-[6.5rem] left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2.5 transition-opacity duration-300 sm:bottom-6 ${
          focusedId || listOpen || aboutOpen ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <span className="pointer-events-none font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--ink-faint)]">
          drag to spin
        </span>
        <button
          onClick={() => setListOpen(true)}
          className="whitespace-nowrap rounded-full border-4 border-[#0a0a0a] bg-[var(--cta)] px-8 py-3.5 text-[15px] font-bold text-[var(--cta-ink)] shadow-[0_0_34px_rgb(255_59_48/0.45)] transition hover:brightness-110 active:scale-[0.98]"
        >
          Get Your Logo
        </button>
      </div>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />

    </section>
  );
}
