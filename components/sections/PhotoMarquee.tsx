import Image from "next/image";

/**
 * A strip of photos that scrolls on its own — no arrows, no dots, nothing to
 * click. The list is rendered three times and the track slides exactly one
 * copy's width, so the loop is seamless; any other distance would visibly
 * jump at the wrap.
 */
export function PhotoMarquee({
  photos,
  alt,
}: {
  photos: { src: string; caption: string }[];
  alt: string;
}) {
  const reel = [...photos, ...photos, ...photos];

  return (
    <div className="marquee">
      <ul className="marquee-track">
        {reel.map((p, i) => (
          <li
            key={`${p.src}-${i}`}
            className="relative aspect-[4/5] w-[13.5rem] shrink-0 overflow-hidden rounded-xl border border-[var(--line)] sm:w-[16rem]"
          >
            <Image
              src={p.src}
              alt={i < photos.length ? `${alt} — ${p.caption}` : ""}
              fill
              sizes="256px"
              className="object-cover"
              loading="eager"
              aria-hidden={i >= photos.length}
            />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgb(5_5_6/0.9)] to-transparent px-3 pb-2.5 pt-8 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-dim)]">
              {p.caption}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
