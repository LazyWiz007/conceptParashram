"use client";

import { AnimatePresence, motion } from "motion/react";
import { TIERS } from "@/content/slots";
import { compact, inr } from "@/lib/format";
import type { Slot } from "@/lib/types";

export function SlotList({
  slots,
  open,
  views,
  onPick,
  onClose,
}: {
  slots: Slot[];
  open: boolean;
  views: Record<string, number>;
  onPick: (slot: Slot) => void;
  onClose: () => void;
}) {
  const order = TIERS.map((t) => t.id);
  const sorted = [...slots].sort(
    (a, b) => order.indexOf(a.tier) - order.indexOf(b.tier) || b.price - a.price,
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-[rgb(6_6_7/0.6)] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-label="Every slot"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 280, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[82svh] w-[min(34rem,92vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
              <div>
                <h2 className="text-base font-semibold">Every slot</h2>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                  {slots.filter((s) => s.status === "open").length} of {slots.length} still open
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-8 w-8 place-items-center rounded-full text-[var(--ink-dim)] transition hover:bg-[rgb(255_255_255/0.12)] hover:text-[var(--ink)]"
              >
                ✕
              </button>
            </div>

            <ul className="scroll-slim divide-y divide-[rgb(255_255_255/0.08)] overflow-y-auto">
              {sorted.map((slot) => {
                const taken = slot.status !== "open";
                const v = views[slot.id];
                return (
                  <li key={slot.id}>
                    <button
                      onClick={() => onPick(slot)}
                      className="flex w-full items-center justify-between gap-3 px-5 py-3 text-left transition hover:bg-[rgb(255_255_255/0.06)]"
                    >
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span
                            className="h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: taken ? "var(--sold)" : `var(--tier-${slot.tier})` }}
                          />
                          <span className="truncate text-sm">{slot.label}</span>
                          {v ? (
                            <span className="shrink-0 font-mono text-[10px] text-[var(--ink-faint)]">
                              {compact(v)} views
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-0.5 block truncate pl-3.5 text-xs text-[var(--ink-faint)]">
                          {taken ? slot.sponsor?.name ?? "Taken" : slot.size}
                        </span>
                      </span>
                      <span
                        className="shrink-0 font-mono text-sm"
                        style={{ color: taken ? "var(--sold)" : "var(--ink)" }}
                      >
                        {taken ? "taken" : inr(slot.price)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
