"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TIERS_BY_ID } from "@/content/slots";
import { compact, inr } from "@/lib/format";
import type { Slot } from "@/lib/types";
import { ClaimOptions } from "./ClaimOptions";

export function SlotCard({
  slot,
  views,
  onClose,
  preview,
  onPreview,
  onStopPreview,
}: {
  slot: Slot | null;
  views: number | undefined;
  onClose: () => void;
  /** Object URL of the visitor's own logo, when they are trying it on. */
  preview: string | null;
  onPreview: (file: File) => void;
  onStopPreview: () => void;
}) {
  const [enquiring, setEnquiring] = useState(false);
  useEffect(() => setEnquiring(false), [slot?.id]);

  /**
   * Peeking: the card folds down to its title bar so the suit behind it is
   * visible. A phone concern only — the desktop card sits to one side and
   * never covers the suit — so the body is hidden with a `sm:` class rather
   * than unmounted, and the toggle itself is hidden from sm up.
   */
  const [peek, setPeek] = useState(false);
  useEffect(() => setPeek(false), [slot?.id]);

  // Trying a logo on is the whole reason to look at the suit, so picking one
  // folds the card away without being asked. Clearing the preview brings it back.
  useEffect(() => setPeek(Boolean(preview)), [preview]);

  return (
    <AnimatePresence>
      {slot && (
        <motion.aside
          key={slot.id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
          // the claim form gets a wider, taller card so it is not a squeeze to fill in
          className={`pointer-events-auto absolute inset-x-3 bottom-3 z-30 overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 backdrop-blur-xl scroll-slim transition-[width] sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-1/2 sm:-translate-y-1/2 sm:p-6 ${
            enquiring
              ? "max-h-[62svh] sm:max-h-[90svh] sm:w-[26rem] sm:p-7"
              : "max-h-[62svh] sm:max-h-[78svh] sm:w-[24rem]"
          } ${
            // folded: no scroll area and a tighter box, so it reads as a bar
            peek ? "overflow-visible py-3 sm:py-6" : ""
          }`}
          aria-label={`${slot.label} details`}
        >
          <header className={`flex items-start justify-between gap-3 ${peek ? "mb-0 sm:mb-5" : "mb-5"}`}>
            <h2 className="text-[15px] font-semibold leading-snug">
              {slot.label}
              {views ? (
                <span className="ml-2 font-normal text-[var(--ink-faint)]">
                  ({compact(views)} views)
                </span>
              ) : null}
            </h2>
            <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => setPeek((v) => !v)}
              aria-label={peek ? "Show slot details" : "Hide the panel and look at the suit"}
              aria-expanded={!peek}
              className="-mt-1 grid h-8 w-8 place-items-center rounded-full text-[var(--ink-dim)] transition hover:bg-[rgb(255_255_255/0.12)] hover:text-[var(--ink)] sm:hidden"
            >
              {peek ? (
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                  <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                  <path d="M3 3l18 18M10.6 10.6a3 3 0 004.2 4.2" />
                  <path d="M7 7.3C4.2 8.9 2 12 2 12s3.6 7 10 7c1.9 0 3.5-.6 4.9-1.4M19.5 15.6C21 14.1 22 12 22 12s-3.6-7-10-7c-.9 0-1.7.1-2.4.3" />
                </svg>
              )}
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[var(--ink-dim)] transition hover:bg-[rgb(255_255_255/0.12)] hover:text-[var(--ink)]"
            >
              ✕
            </button>
            </div>
          </header>

          <div className={peek ? "hidden sm:block" : undefined}>
          {slot.status !== "open" ? (
            <Taken slot={slot} />
          ) : enquiring ? (
            <ClaimOptions slot={slot} onBack={() => setEnquiring(false)} />
          ) : (
            <Available
              slot={slot}
              onClaim={() => setEnquiring(true)}
              preview={preview}
              onPreview={onPreview}
              onStopPreview={onStopPreview}
            />
          )}
          </div>

          {/* while folded, say how to get the card back */}
          {peek && (
            <p className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-faint)] sm:hidden">
              {preview ? "On the suit" : "Hidden"} · tap the eye
            </p>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/** Sold slots lead with the sponsor, the way the reference site does. */
function Taken({ slot }: { slot: Slot }) {
  const s = slot.sponsor;
  const brand = s?.color ?? "var(--sold)";

  return (
    <div className="text-center">
      <div
        className="mx-auto grid h-28 w-28 place-items-center overflow-hidden rounded-[1.4rem]"
        style={{ background: brand }}
      >
        {s?.logo ? (
          <Image
            src={s.logo}
            alt={s.name}
            width={112}
            height={112}
            className="h-full w-full object-contain p-3"
            unoptimized
          />
        ) : (
          <span className="px-2 text-lg font-bold text-[#0a0a0a]">{s?.name}</span>
        )}
      </div>

      <h3 className="mt-4 text-2xl font-semibold tracking-tight">{s?.name}</h3>

      {s?.handle && (
        <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-[var(--ink-dim)]">
          by
          <span
            className="grid h-5 w-5 place-items-center overflow-hidden rounded-full"
            style={{ background: brand }}
            aria-hidden
          >
            {s.logo && (
              <Image src={s.logo} alt="" width={20} height={20} className="object-contain p-0.5" unoptimized />
            )}
          </span>
          {s.handle}
        </p>
      )}

      {s?.tagline && <p className="mt-2 text-sm text-[var(--ink-dim)]">{s.tagline}</p>}

      {s?.url && (
        <a
          href={s.url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-sm text-[var(--accent)] underline-offset-4 hover:underline"
        >
          {s.url.replace(/^https?:\/\//, "").replace(/\/$/, "")} ↗
        </a>
      )}

      <div className="mt-6 rounded-xl border border-[var(--line)] bg-[rgb(255_255_255/0.05)] px-4 py-5">
        <p className="text-sm text-[var(--ink-dim)]">Sponsored for</p>
        <p className="mt-1 text-3xl font-semibold tracking-tight">{inr(slot.price)}</p>
      </div>
    </div>
  );
}

function Deliverables({ slot, tier }: { slot: Slot; tier: { deliverables: readonly string[] } }) {
  return (
    <ul className="mt-2 space-y-1 sm:mt-0">
      {tier.deliverables.map((d) => (
        <li key={d} className="flex gap-2 text-sm text-[var(--ink-dim)]">
          <span style={{ color: `var(--tier-${slot.tier})` }}>—</span>
          <span>{d}</span>
        </li>
      ))}
    </ul>
  );
}

const LOGO_TYPES = "image/png,image/jpeg,image/webp,image/svg+xml";
const LOGO_MAX = 5 * 1024 * 1024;

function Available({
  slot,
  onClaim,
  preview,
  onPreview,
  onStopPreview,
}: {
  slot: Slot;
  onClaim: () => void;
  preview: string | null;
  onPreview: (file: File) => void;
  onStopPreview: () => void;
}) {
  const tier = TIERS_BY_ID.get(slot.tier)!;
  const picker = useRef<HTMLInputElement>(null);
  const [pickError, setPickError] = useState<string | null>(null);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // so choosing the same file again still fires
    if (!file) return;
    if (!LOGO_TYPES.split(",").includes(file.type)) return setPickError("PNG, JPG, WebP or SVG only.");
    if (file.size > LOGO_MAX) return setPickError("Keep it under 5 MB.");
    setPickError(null);
    onPreview(file);
  }

  return (
    <div className="space-y-4">
      <div>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: `var(--tier-${slot.tier})` }}
        >
          {tier.name}
        </span>
        <p className="mt-0.5 font-mono text-[11px] text-[var(--ink-faint)]">{slot.size}</p>
      </div>

      {/* the pitch reads well on a desktop card and swamps a phone one */}
      <p className="hidden text-sm leading-relaxed text-[var(--ink-dim)] sm:block">{slot.pitch}</p>

      {/*
        Four deliverables plus the pitch pushed the price and the buttons below
        the fold on a phone, so here the list is folded away behind a tap. The
        desktop card has the room and shows it outright.
      */}
      <details className="group rounded-lg border border-[var(--line)] px-3 py-2.5 sm:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
          What you get
          <span className="transition-transform group-open:rotate-180" aria-hidden>
            ⌄
          </span>
        </summary>
        <Deliverables slot={slot} tier={tier} />
      </details>

      <div className="hidden sm:block">
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
          What you get
        </p>
        <Deliverables slot={slot} tier={tier} />
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-[rgb(255_255_255/0.05)] px-4 py-4">
        <p className="text-sm text-[var(--ink-dim)]">Price</p>
        <p className="mt-0.5 text-3xl font-semibold tracking-tight">{inr(slot.price)}</p>
      </div>

      <input ref={picker} type="file" accept={LOGO_TYPES} onChange={pick} className="hidden" />

      {preview ? (
        <div className="space-y-3 rounded-xl border border-[var(--line-strong)] bg-[rgb(255_255_255/0.05)] p-3">
          <div className="flex items-center gap-3">
            {/* a checkerboard, so a transparent logo shows as transparent here too */}
            <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-lg bg-[conic-gradient(#3a3a3f_25%,#26262a_0_50%,#3a3a3f_0_75%,#26262a_0)] bg-[length:12px_12px]">
              {/* eslint-disable-next-line @next/next/no-img-element -- a local blob URL, nothing to optimise */}
              <img src={preview} alt="Your logo" className="h-full w-full object-contain p-1.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--ink)]">Your logo is on the suit.</p>
              <p className="text-xs text-[var(--ink-faint)]">
                Empty slots are hidden. Only on your screen — nothing is uploaded.
              </p>
            </div>
          </div>

          {/* real buttons, not links: these are the only way out of the preview */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => picker.current?.click()}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-[var(--accent)] px-3 py-2.5 text-sm font-semibold text-[var(--accent)] transition hover:bg-[rgb(255_212_0/0.12)]"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M10 13V3M6 7l4-4 4 4M3 13v3a1 1 0 001 1h12a1 1 0 001-1v-3" />
              </svg>
              Change logo
            </button>
            <button
              onClick={onStopPreview}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-[var(--line-strong)] px-3 py-2.5 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--ink)] hover:bg-[rgb(255_255_255/0.08)]"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
              Stop preview
            </button>
          </div>
        </div>
      ) : null}

      {pickError && <p className="text-xs text-[var(--accent)]">{pickError}</p>}

      <div className="flex flex-col gap-2">
        <button
          onClick={onClaim}
          className="w-full rounded-xl px-4 py-4 text-base font-semibold text-[#0a0a0b] transition hover:brightness-110"
          style={{ background: `var(--tier-${slot.tier})` }}
        >
          Claim your spot and add your logo
        </button>
        {!preview && (
          <button
            onClick={() => picker.current?.click()}
            className="w-full rounded-lg border border-[var(--line-strong)] px-4 py-3 text-sm font-semibold text-[var(--ink)] transition hover:bg-[rgb(255_255_255/0.08)]"
          >
            Try your logo on the suit
          </button>
        )}
      </div>
    </div>
  );
}
