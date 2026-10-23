"use client";

import { athlete, race } from "@/content/site";
import { inr } from "@/lib/format";
import type { Slot } from "@/lib/types";
import { EnquiryForm } from "./EnquiryForm";

/**
 * What "Claim your spot" opens. Two ways to reach a human rather than a form —
 * both land in a channel Parashram already reads, so nothing depends on the
 * site's own mail delivery working.
 */
export function ClaimOptions({ slot, onBack }: { slot: Slot; onBack: () => void }) {
  const subject = `Sponsoring the ${slot.label} — ${race.name}`;
  const body = [
    `Hi Parashram,`,
    ``,
    `I'd like to sponsor the ${slot.label} slot (${inr(slot.price)}) on your ${race.name} trisuit.`,
    ``,
    `Company:`,
    `Website:`,
    `Contact number:`,
    ``,
    `Anything you need from us:`,
    ``,
  ].join("\n");

  const mailto = `mailto:${athlete.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-[var(--ink-dim)]">
        <span className="text-[var(--ink)]">{slot.label}</span> · {inr(slot.price)}. Get in touch
        and we&rsquo;ll take it from there — nothing is committed until you have an invoice.
      </p>

      <div>
        <a
          href={athlete.instagram}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2.5 rounded-lg px-4 py-4 text-base font-semibold text-[#0a0a0b] transition hover:brightness-110"
          style={{ background: `var(--tier-${slot.tier})` }}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
          </svg>
          Send a DM on Instagram
        </a>

      </div>

      {/*
        The form is desktop only. On a phone it filled the card and pushed the
        suit off screen entirely; Instagram and email both reach Parashram just
        as well and cost a visitor one tap.
      */}
      <div className="hidden items-center gap-3 sm:flex">
        <span className="h-px flex-1 bg-[var(--line)]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
          or leave your details
        </span>
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <div className="hidden sm:block">
        <EnquiryForm slot={slot} />
      </div>

      {/* spelled out so it can be copied by anyone whose mail client will not open */}
      <div className="rounded-lg border border-[var(--line)] bg-[rgb(255_255_255/0.03)] px-4 py-3 text-center">
        <p className="font-mono text-2xs uppercase tracking-[0.14em] text-[var(--ink-faint)]">
          Or write to
        </p>
        <a href={mailto} className="mt-1 block text-sm text-[var(--ink)] underline-offset-4 hover:underline">
          {athlete.email}
        </a>
        <p className="mt-2 select-all font-mono text-2xs text-[var(--ink-faint)]">
          {athlete.handle}
        </p>
      </div>

      <button
        onClick={onBack}
        className="w-full rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm text-[var(--ink-dim)] transition hover:text-[var(--ink)]"
      >
        Back
      </button>
    </div>
  );
}
