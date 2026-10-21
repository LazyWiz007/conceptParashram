import { athlete, faq } from "@/content/site";
import { Section } from "./Section";

export function FaqSection() {
  return (
    <Section id="faq" eyebrow="Questions" title="Before you ask">
      <div className="grid gap-x-12 gap-y-9 md:grid-cols-2">
        {faq.map((item) => (
          <div key={item.q}>
            <h3 className="text-base font-semibold text-[var(--ink)]">{item.q}</h3>
            <p className="mt-1.5 text-base leading-relaxed text-[var(--ink-dim)]">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[var(--line)] pt-8 text-base">
        <a href={`mailto:${athlete.email}`} className="text-[var(--ink)] underline-offset-4 hover:underline">
          {athlete.email}
        </a>
        <span className="text-[var(--ink-dim)]">{athlete.phone}</span>
        <a
          href={athlete.instagram}
          target="_blank"
          rel="noreferrer"
          className="text-[var(--ink-dim)] transition hover:text-[var(--ink)]"
        >
          Instagram ↗
        </a>
        <a
          href={athlete.strava}
          target="_blank"
          rel="noreferrer"
          className="text-[var(--ink-dim)] transition hover:text-[var(--ink)]"
        >
          Strava ↗
        </a>
      </div>
    </Section>
  );
}
