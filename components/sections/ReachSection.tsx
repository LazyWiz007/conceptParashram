import Image from "next/image";
import { athlete, reach } from "@/content/site";
import { compact } from "@/lib/format";
import { listPhotos } from "@/lib/photos";
import { Section } from "./Section";

export async function ReachSection() {
  const photos = await listPhotos();

  return (
    <Section
      id="reach"
      eyebrow="Reach"
      title="Who sees it"
      lede="A logo on a suit is worth whatever gets seen. Here is the audience it is seen by, on race day and in the eleven months of training either side of it."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {reach.stats.filter((s) => s.value > 0).map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-[var(--line)] bg-[rgb(16_16_18/0.5)] p-5"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
              {s.label}
            </p>
            <p className="mt-2.5 text-4xl font-semibold tabular-nums">
              {compact(s.value)}
            </p>
            <p className="mt-1 text-sm text-[var(--ink-dim)]">{s.suffix}</p>
          </div>
        ))}
      </div>

      {photos.length > 0 ? (
        <ul className="scroll-slim mt-8 -mx-5 flex snap-x snap-mandatory scroll-pl-5 gap-3 overflow-x-auto px-5 pb-3 sm:-mx-8 sm:scroll-pl-8 sm:px-8">
          {photos.map((src) => (
            <li
              key={src}
              className="relative aspect-[4/5] w-[17rem] shrink-0 snap-start overflow-hidden rounded-xl border border-[var(--line)]"
            >
              <Image
                src={src}
                alt=""
                fill
                sizes="272px"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-[var(--line)] px-5 py-6 text-base text-[var(--ink-faint)]">
          Race photos go in <code className="text-[var(--ink-dim)]">public/media/photos/</code> —
          drop them in and they appear here.
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {reach.raceDay.filter((s) => s.value !== "TODO").map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-[var(--line)] bg-[rgb(16_16_18/0.3)] p-5"
          >
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
              {s.label}
            </p>
            <p className="mt-2.5 text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 max-w-[62ch] text-base leading-relaxed text-[var(--ink-dim)]">
        {reach.note}{" "}
        <a
          href={athlete.instagram}
          target="_blank"
          rel="noreferrer"
          className="text-[var(--ink)] underline-offset-4 hover:underline"
        >
          {athlete.handle} ↗
        </a>
      </p>
    </Section>
  );
}
