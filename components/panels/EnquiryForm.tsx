"use client";

import { useRef, useState } from "react";
import { athlete } from "@/content/site";
import type { Slot } from "@/lib/types";

type State = "idle" | "sending" | "sent" | "error";

/** Ten digits starting 6-9, with an optional +91 or 0. Mirrors the API. */
const INDIAN_MOBILE = /^(?:\+?91|0)?[6-9]\d{9}$/;
const clean = (v: string) => v.replace(/[\s\-()]/g, "");

export function EnquiryForm({ slot }: { slot: Slot }) {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  // the API drops anything submitted within three seconds of the form opening
  const openedAt = useRef(Date.now());

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    const phone = clean(String(fd.get("phone") ?? ""));
    if (!INDIAN_MOBILE.test(phone)) {
      setPhoneError("Enter a 10-digit Indian mobile number");
      return;
    }
    setPhoneError(null);
    setState("sending");
    setError(null);

    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(fd),
          slotId: slot.id,
          openedAt: openedAt.current,
        }),
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
      <div className="rounded-xl border border-[var(--line)] bg-[rgb(255_255_255/0.04)] px-4 py-5 text-center">
        <p className="text-sm font-semibold text-[var(--ink)]">Sent.</p>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-dim)]">
          {athlete.name} will be in touch, usually within a day. Nothing is committed until you
          have an invoice.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field name="contact" label="Your name" required autoComplete="name" />
        <Field name="company" label="Company" required autoComplete="organization" />
      </div>

      <Field
        name="phone"
        label="Phone"
        required
        type="tel"
        inputMode="numeric"
        placeholder="98765 43210"
        autoComplete="tel"
        error={phoneError}
        onInput={() => phoneError && setPhoneError(null)}
      />

      <Field name="email" label="Email" type="email" required autoComplete="email" />
      <Field name="message" label="Message" textarea />

      {/* honeypot: a real person never sees this */}
      <input
        name="company_url"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      {error && <p className="text-xs leading-relaxed text-[var(--cta)]">{error}</p>}

      <button
        type="submit"
        disabled={state === "sending"}
        className="w-full rounded-lg bg-[var(--cta)] px-4 py-3.5 text-sm font-bold text-[var(--cta-ink)] transition hover:brightness-110 disabled:opacity-50"
      >
        {state === "sending" ? "Sending…" : "Send enquiry"}
      </button>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  textarea,
  error,
  ...rest
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  textarea?: boolean;
  error?: string | null;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const cls = `w-full rounded-lg border bg-[rgb(255_255_255/0.04)] px-3 py-2.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-faint)] focus:border-[var(--line-strong)] ${
    error ? "border-[var(--cta)]" : "border-[var(--line)]"
  }`;

  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
        {label}
        {required && <span className="ml-1 text-[var(--accent)]">*</span>}
      </span>
      {textarea ? (
        <textarea name={name} rows={3} className={cls} />
      ) : (
        <input name={name} type={type} required={required} className={cls} {...rest} />
      )}
      {error && <span className="mt-1 block text-[11px] text-[var(--cta)]">{error}</span>}
    </label>
  );
}
