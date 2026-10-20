import { reach } from "@/content/site";
import { compact } from "@/lib/format";
import { Section } from "./Section";

export function ReachSection() {
  return (
    <Section
      id="reach"
      eyebrow="Reach"
      title="What you are actually buying"
      lede="A logo on a suit is worth whatever gets seen. These are the numbers behind that, and you get the real ones again after the race."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {reach.stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-[var(--line)] bg-[rgb(6_16_26/0.5)] p-5"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
              {s.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums">
              {s.value > 0 ? compact(s.value) : "—"}
            </p>
            <p className="mt-0.5 text-xs text-[var(--ink-dim)]">{s.suffix}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {reach.raceDay.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-[var(--line)] bg-[rgb(6_16_26/0.3)] p-5"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
              {s.label}
            </p>
            <p className="mt-2 text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <p className="mt-6 max-w-[62ch] text-sm leading-relaxed text-[var(--ink-dim)]">{reach.note}</p>
    </Section>
  );
}
