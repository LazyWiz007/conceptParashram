"use client";

import { useActivity } from "@/lib/useLive";

const COUNTRY: Record<string, string> = {
  IN: "India", US: "United States", GB: "United Kingdom", AE: "UAE", SG: "Singapore",
  AU: "Australia", DE: "Germany", FR: "France", CA: "Canada", NL: "Netherlands",
  JP: "Japan", ZA: "South Africa", ES: "Spain", IT: "Italy", NZ: "New Zealand",
};

/** Flags come from the emoji block — no sprite sheet, no extra requests. */
function flag(cc: string): string {
  if (cc.length !== 2) return "🌐";
  return String.fromCodePoint(...[...cc.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

export function ActivityTicker() {
  const activity = useActivity();
  if (!activity || activity.visitorsToday === 0) return null;

  return (
    <div className="pointer-events-none select-none font-mono text-[11px] leading-relaxed text-[var(--ink-faint)]">
      <p className="flex items-center gap-1.5 text-[var(--ink-dim)]">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
        </span>
        <span className="text-[var(--ink)]">{activity.visitorsToday}</span> looked today
      </p>
      <ul className="mt-1.5 space-y-0.5">
        {activity.events.slice(0, 3).map((e) => (
          <li key={e.id} className="flex items-center gap-2">
            <span aria-hidden>{flag(e.country)}</span>
            <span>{COUNTRY[e.country] ?? e.country}</span>
            <span className="tabular-nums opacity-60">
              {new Date(e.seenAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
