"use client";

import { useState } from "react";
import { inr } from "@/lib/format";
import type { Slot } from "@/lib/types";

type State = "idle" | "sending" | "sent" | "error";

export function EnquiryForm({ slot, onDone }: { slot: Slot; onDone: () => void }) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError(null);
    const fd = new FormData(e.currentTarget);
    const body = { slotId: slot.id, ...Object.fromEntries(fd) };

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setState("sent");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (state === "sent") {
    return (
      <div className="space-y-3 py-2">
        <p className="text-sm text-[var(--ink)]">
          Sent. You will hear back from me personally, usually within a day.
        </p>
        <p className="text-xs text-[var(--ink-dim)]">
          Nothing is committed and nothing is charged until you have an invoice in hand.
        </p>
        <button
          onClick={onDone}
          className="mt-1 w-full rounded-lg border border-[var(--line)] px-4 py-2.5 text-sm text-[var(--ink-dim)] transition hover:text-[var(--ink)]"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--ink-dim)]">
        Enquiring about <span className="text-[var(--ink)]">{slot.label}</span> · {inr(slot.price)}.
        No payment here — you get an invoice after we talk.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="company" label="Company" required />
        <Field name="contact" label="Your name" required />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="email" label="Email" type="email" required />
        <Field name="phone" label="Phone" />
      </div>
      <Field name="website" label="Website" />
      <Field name="message" label="Anything else?" textarea />

      {/* honeypot */}
      <input
        name="company_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {error && <p className="text-sm text-[var(--accent)]">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg border border-[var(--line)] px-5 py-3.5 text-[15px] text-[var(--ink-dim)] transition hover:text-[var(--ink)]"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={state === "sending"}
          className="flex-1 rounded-lg px-4 py-3.5 text-[15px] font-semibold text-[#0a0a0b] transition disabled:opacity-50"
          style={{ background: `var(--tier-${slot.tier})` }}
        >
          {state === "sending" ? "Sending…" : "Send enquiry"}
        </button>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  textarea,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
}) {
  const cls =
    "w-full rounded-lg border border-[var(--line)] bg-[rgb(10_10_11/0.6)] px-3.5 py-3 text-[15px] text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-faint)] focus:border-[var(--line-strong)]";
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-dim)]">
        {label}
        {required && <span className="ml-1 text-[var(--accent)]">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} rows={4} className={cls} />
      ) : (
        <input name={name} type={type} required={required} className={cls} />
      )}
    </label>
  );
}
