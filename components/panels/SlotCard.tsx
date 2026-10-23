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
            enquiring ? "max-h-[90svh] sm:w-[26rem] sm:p-7" : "max-h-[78svh] sm:w-[24rem]"
          }`}
          aria-label={`${slot.label} details`}
        >
          <header className="mb-5 flex items-start justify-between gap-3">
            <h2 className="text-[15px] font-semibold leading-snug">
              {slot.label}
              {views ? (
                <span className="ml-2 font-normal text-[var(--ink-faint)]">
                  ({compact(views)} views)
                </span>
              ) : null}
            </h2>
            <button
              onClick={onClose}
              aria-label="Close"
              className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[var(--ink-dim)] transition hover:bg-[rgb(255_255_255/0.12)] hover:text-[var(--ink)]"
            >
              ✕
            </button>
          </header>

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

      <p className="text-sm leading-relaxed text-[var(--ink-dim)]">{slot.pitch}</p>

      <div>
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
          What you get
        </p>
        <ul className="space-y-1">
          {tier.deliverables.map((d) => (
            <li key={d} className="flex gap-2 text-sm text-[var(--ink-dim)]">
              <span style={{ color: `var(--tier-${slot.tier})` }}>—</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
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
