import { race } from "@/content/site";
import { Section } from "./Section";

export function RaceSection() {
  const when = new Date(race.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Section id="race" eyebrow="The race" title={race.name} lede={race.goal}>
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          {race.story.map((p, i) => (
            <p
              key={i}
              className={
                i === 0
                  ? "text-xl leading-snug text-[var(--ink)]"
                  : "leading-relaxed text-[var(--ink-dim)]"
              }
            >
              {p}
            </p>
          ))}
        </div>

        <dl className="h-fit space-y-4 rounded-2xl border border-[var(--line)] bg-[rgb(6_16_26/0.5)] p-5">
          {[
            ["Date", when],
            ["Where", race.location],
            ["Distance", race.distance],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                {k}
              </dt>
              <dd className="mt-1 text-sm leading-snug text-[var(--ink)]">{v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Section>
  );
}
