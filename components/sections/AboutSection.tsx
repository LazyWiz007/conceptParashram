import Image from "next/image";
import { athlete, race, social, track } from "@/content/site";
import { compact } from "@/lib/format";
import { listPhotos } from "@/lib/photos";
import { Section } from "./Section";

export async function AboutSection() {
  const photos = await listPhotos();
  const portrait = photos[0] ?? null;

  const when = race.dateConfirmed
    ? new Date(race.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "To be confirmed";

  return (
    <Section id="about" eyebrow="About" title={athlete.name} lede={athlete.tagline}>
      <div className="grid gap-10 md:grid-cols-[1fr_1.15fr] md:gap-12">
        {portrait && (
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--line)]">
            <Image
              src={portrait}
              alt={athlete.name}
              fill
              sizes="(max-width: 768px) 92vw, 36vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
            {athlete.title}
          </p>

          <div className="mt-5 space-y-4">
            {race.story.map((p, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "text-2xl font-medium leading-snug text-[var(--ink)]"
                    : "text-[17px] leading-relaxed text-[var(--ink-dim)]"
                }
              >
                {p}
              </p>
            ))}
          </div>

          <dl className="mt-7 flex flex-wrap gap-x-9 gap-y-4">
            {[
              [compact(social.followers), "followers"],
              [String(social.posts), "posts"],
              [when, "race day"],
            ].map(([v, k]) => (
              <div key={k}>
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                  {k}
                </dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums">{v}</dd>
              </div>
            ))}
          </dl>

          <a
            href={athlete.instagram}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2 text-sm text-[var(--ink-dim)] transition hover:border-[var(--line-strong)] hover:text-[var(--ink)]"
          >
            {athlete.handle} ↗
          </a>
        </div>
      </div>

      <div className="mt-12 border-t border-[var(--line)] pt-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--ink-faint)]">
          Raced so far
        </p>
        <ul className="mt-4 flex flex-wrap gap-2.5">
          {track.map((t) => (
            <li
              key={t}
              className="rounded-full border border-[var(--line)] bg-[rgb(255_212_0/0.06)] px-4 py-2 text-sm text-[var(--ink-dim)]"
            >
              {t}
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
