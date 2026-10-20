import { SLOTS, TIERS } from "@/content/slots";
import { inr } from "@/lib/format";
import { Section } from "./Section";

export function TiersSection() {
  return (
    <Section
      id="tiers"
      eyebrow="Tiers"
      title="Four prices, one principle"
      lede="You are paying for how long people look at that patch of fabric, not how big it is. The upper back costs the most because an Ironman is eleven hours of the person behind you reading it."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {TIERS.map((tier) => {
          const slots = SLOTS.filter((s) => s.tier === tier.id);
          const open = slots.filter((s) => s.status === "open").length;
          return (
            <article
              key={tier.id}
              className="flex flex-col rounded-2xl border border-[var(--line)] bg-[rgb(6_16_26/0.5)] p-6"
              style={{ borderTopColor: `var(--tier-${tier.id})`, borderTopWidth: 2 }}
            >
              <header className="flex items-baseline justify-between gap-4">
                <h3
                  className="font-mono text-xs uppercase tracking-[0.2em]"
                  style={{ color: `var(--tier-${tier.id})` }}
                >
                  {tier.name}
                </h3>
                <p className="text-2xl font-semibold">{inr(slots[0]?.price ?? 0)}</p>
              </header>

              <p className="mt-3 text-sm leading-relaxed text-[var(--ink-dim)]">{tier.blurb}</p>

              <ul className="mt-4 space-y-1.5">
                {tier.deliverables.map((d) => (
                  <li key={d} className="flex gap-2.5 text-sm text-[var(--ink-dim)]">
                    <span style={{ color: `var(--tier-${tier.id})` }}>—</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-5 border-t border-[var(--line)] pt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
                {open} of {slots.length} open · {slots.map((s) => s.label).join(", ")}
              </p>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
