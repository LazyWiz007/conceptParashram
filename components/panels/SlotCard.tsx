"use client";

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
          className="pointer-events-auto absolute inset-x-3 bottom-3 z-30 max-h-[76svh] overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 backdrop-blur-xl scroll-slim sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-1/2 sm:w-[23rem] sm:-translate-y-1/2 sm:p-5"
          aria-label={`${slot.label} details`}
        >
          <Header slot={slot} views={views} onClose={onClose} />

          {enquiring ? (
            <EnquiryForm slot={slot} onDone={() => setEnquiring(false)} />
          ) : (
            <Detail slot={slot} onClaim={() => setEnquiring(true)} />
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function Header({ slot, views, onClose }: { slot: Slot; views?: number; onClose: () => void }) {
  const tier = TIERS_BY_ID.get(slot.tier)!;
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <span
          className="font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: `var(--tier-${slot.tier})` }}
        >
          {tier.name}
        </span>
        <h2 className="mt-0.5 text-lg font-semibold leading-tight">{slot.label}</h2>
        <p className="mt-0.5 font-mono text-[11px] text-[var(--ink-faint)]">
          {slot.size}
          {views ? ` · ${compact(views)} views` : ""}
        </p>
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[var(--ink-dim)] transition hover:bg-[rgb(56_189_248/0.12)] hover:text-[var(--ink)]"
      >
        ✕
      </button>
    </div>
  );
}

function Detail({ slot, onClaim }: { slot: Slot; onClaim: () => void }) {
  const tier = TIERS_BY_ID.get(slot.tier)!;
  const taken = slot.status !== "open";

  return (
    <div className="space-y-4">
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

      <div className="flex items-end justify-between border-t border-[var(--line)] pt-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            {taken ? "Taken by" : "Price"}
          </p>
          <p className="text-xl font-semibold">
            {taken ? slot.sponsor?.name ?? "Sold" : inr(slot.price)}
          </p>
        </div>
      </div>

      <button
        onClick={onClaim}
        disabled={taken}
        className="w-full rounded-lg px-4 py-3 text-sm font-semibold text-[#03131c] transition disabled:cursor-not-allowed disabled:bg-[var(--sold)] disabled:text-[var(--void)]"
        style={taken ? undefined : { background: `var(--tier-${slot.tier})` }}
      >
        {taken ? "Already taken" : "Claim this slot"}
      </button>
    </div>
  );
}
