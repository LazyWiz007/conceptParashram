"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { TIERS_BY_ID } from "@/content/slots";
import { compact, inr } from "@/lib/format";
import type { Slot } from "@/lib/types";
import { EnquiryForm } from "./EnquiryForm";

export function SlotCard({
  slot,
  views,
  onClose,
}: {
  slot: Slot | null;
  views: number | undefined;
  onClose: () => void;
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
          className="pointer-events-auto absolute inset-x-3 bottom-3 z-30 max-h-[78svh] overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 backdrop-blur-xl scroll-slim sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-1/2 sm:w-[24rem] sm:-translate-y-1/2 sm:p-6"
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
            <EnquiryForm slot={slot} onDone={() => setEnquiring(false)} />
          ) : (
            <Available slot={slot} onClaim={() => setEnquiring(true)} />
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

function Available({ slot, onClaim }: { slot: Slot; onClaim: () => void }) {
  const tier = TIERS_BY_ID.get(slot.tier)!;

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

      <button
        onClick={onClaim}
        className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-[#0a0a0b] transition"
        style={{ background: `var(--tier-${slot.tier})` }}
      >
        Claim this slot
      </button>
    </div>
  );
}
