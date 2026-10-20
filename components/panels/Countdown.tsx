"use client";

import { useCountdown } from "@/lib/useLive";

export function Countdown({ iso, compactLayout }: { iso: string; compactLayout?: boolean }) {
  const t = useCountdown(iso);
  if (!t) return <div className="h-[34px]" aria-hidden />;
  if (t.done) {
    return <p className="font-mono text-sm uppercase tracking-[0.18em] text-[var(--tier-title)]">Race day</p>;
  }

  const units = [
    { v: t.days, l: "days" },
    { v: t.hours, l: "hrs" },
    { v: t.minutes, l: "min" },
    ...(compactLayout ? [] : [{ v: t.seconds, l: "sec" }]),
  ];

  return (
    <div className="flex items-end gap-3" aria-label={`${t.days} days to race day`}>
      {units.map((u) => (
        <div key={u.l} className="flex items-baseline gap-1">
          <span className="font-mono text-xl font-semibold tabular-nums leading-none text-[var(--ink)]">
            {String(u.v).padStart(2, "0")}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            {u.l}
          </span>
        </div>
      ))}
    </div>
  );
}
