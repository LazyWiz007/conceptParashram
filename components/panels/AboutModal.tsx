"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import { aboutPhotos, athlete, race, social, track } from "@/content/site";
import { compact } from "@/lib/format";
import { PhotoCarousel } from "@/components/sections/PhotoCarousel";

export function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  // the page itself never scrolls, so the only scroll to worry about is inside
  // this dialog; close on Escape the way a dialog should
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const when = race.dateConfirmed
    ? new Date(race.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "To be confirmed";

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-[rgb(3_3_4/0.72)] backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-label={`About ${athlete.name}`}
            initial={{ opacity: 0, y: 26, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.985 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[88svh] w-[min(62rem,94vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-[rgb(10_10_12/0.97)] backdrop-blur-xl"
          >
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-[var(--line)] px-6 py-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--accent)]">
                  About
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">{athlete.name}</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-[var(--ink-dim)] transition hover:bg-[rgb(255_255_255/0.08)] hover:text-[var(--ink)]"
              >
                ✕
              </button>
            </header>

            <div className="scroll-slim overflow-y-auto px-6 py-7">
              <div className="grid gap-9 md:grid-cols-[1fr_1.1fr]">
                <PhotoCarousel photos={aboutPhotos} alt={athlete.name} />

                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
                    {athlete.title}
                  </p>
                  <div className="mt-4 space-y-3.5">
                    {race.story.map((p, i) => (
                      <p
                        key={i}
                        className={
                          i === 0
                            ? "text-xl font-medium leading-snug text-[var(--ink)]"
                            : "text-base leading-relaxed text-[var(--ink-dim)]"
                        }
                      >
                        {p}
                      </p>
                    ))}
                  </div>

                  <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-4">
                    {[
                      [compact(social.followers), "followers"],
                      [String(social.posts), "posts"],
                      [when, "race day"],
                    ].map(([v, k]) => (
                      <div key={k}>
                        <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                          {k}
                        </dt>
                        <dd className="mt-1 text-lg font-semibold tabular-nums">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <div className="mt-9 grid items-center gap-7 border-t border-[var(--line)] pt-8 md:grid-cols-[1.2fr_1fr]">
                <a
                  href={athlete.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-xl border border-[var(--line)] transition hover:border-[var(--line-strong)]"
                >
                  <Image
                    src={social.screenshot}
                    alt={`${athlete.handle} on Instagram`}
                    width={1293}
                    height={936}
                    sizes="(max-width: 768px) 88vw, 36vw"
                    className="w-full"
                  />
                </a>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]">
                    Not a hypothetical
                  </p>
                  <p className="mt-3 text-base leading-relaxed text-[var(--ink-dim)]">
                    {compact(social.followers)} people already follow the training. They will watch
                    this race whether or not anyone sponsors it — your logo just comes along.
                  </p>
                  <a
                    href={athlete.instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--ink-dim)] transition hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
                  >
                    {athlete.handle} ↗
                  </a>
                </div>
              </div>

              <div className="mt-9 border-t border-[var(--line)] pt-7">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ink-faint)]">
                  Raced so far
                </p>
                <ul className="mt-3.5 flex flex-wrap gap-2">
                  {track.map((t) => (
                    <li
                      key={t}
                      className="rounded-full border border-[var(--line)] bg-[rgb(255_212_0/0.06)] px-3.5 py-1.5 text-sm text-[var(--ink-dim)]"
                    >
                      {t}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-sm text-[var(--ink-faint)]">
                  {athlete.email}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
