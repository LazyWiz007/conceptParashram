import { documentary } from "@/content/site";
import { Section } from "./Section";

export function DocumentarySection() {
  return (
    <Section
      id="film"
      eyebrow="The documentary"
      title={documentary.title}
      lede={documentary.blurb}
      className="bg-[rgb(10_10_11/0.6)]"
    >
      <ul className="scroll-slim -mx-5 flex snap-x snap-mandatory scroll-pl-5 gap-4 overflow-x-auto px-5 pb-4 sm:-mx-8 sm:scroll-pl-8 sm:px-8">
        {documentary.episodes.map((ep) => (
          <li
            key={ep.n}
            className="flex w-[17rem] shrink-0 snap-start flex-col rounded-2xl border border-[var(--line)] bg-[rgb(16_16_18/0.6)] p-5"
          >
            <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--tier-title)]">
              Ep {String(ep.n).padStart(2, "0")}
            </span>
            <h3 className="mt-2.5 text-xl font-semibold leading-tight">{ep.title}</h3>
            <p className="mt-2 text-base leading-relaxed text-[var(--ink-dim)]">{ep.blurb}</p>
          </li>
        ))}
      </ul>

      <div className="mt-8 grid gap-6 rounded-2xl border border-[var(--line)] bg-[rgb(16_16_18/0.4)] p-6 md:grid-cols-[1fr_auto]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
            Every sponsor gets
          </p>
          <ul className="mt-3 space-y-1.5">
            {documentary.sponsorGets.map((g) => (
              <li key={g} className="flex gap-2.5 text-base text-[var(--ink-dim)]">
                <span className="text-[var(--tier-title)]">—</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
        <dl className="grid h-fit gap-3 text-sm md:text-right">
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
              Produced by
            </dt>
            <dd className="mt-0.5">{documentary.producer}</dd>
          </div>
          <div>
            <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
              Releasing on
            </dt>
            <dd className="mt-0.5">{documentary.platform}</dd>
          </div>
        </dl>
      </div>
    </Section>
  );
}
