"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Scroll-snap carousel. The track does the work, so a phone swipe is native
 * and the buttons just scroll it — no drag handling to get wrong, and it still
 * behaves if JavaScript is slow to arrive.
 */
export function PhotoCarousel({
  photos,
  alt,
}: {
  photos: { src: string; caption: string }[];
  alt: string;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(photos.length - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
  }, [photos.length]);

  // follow the scroll position rather than assuming the buttons caused it,
  // so swiping keeps the dots and caption in step
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setIndex(Math.round(el.scrollLeft / Math.max(1, el.clientWidth)));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="relative">
      <ul
        ref={track}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl border border-[var(--line)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photos.map((p, i) => (
          <li key={p.src} className="relative aspect-[4/5] w-full shrink-0 snap-center">
            <Image
              src={p.src}
              alt={`${alt} — ${p.caption}`}
              fill
              sizes="(max-width: 768px) 92vw, 42vw"
              className="object-cover"
              priority={i === 0}
              // Lazy loading never fires for a slide parked off to the side of
              // a horizontal scroller, so you swipe onto a blank. Four small
              // photos are cheap enough to just fetch.
              loading="eager"
            />
          </li>
        ))}
      </ul>

      <button
        onClick={() => goTo(index - 1)}
        disabled={index === 0}
        aria-label="Previous photo"
        className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[var(--line)] bg-[rgb(10_10_12/0.7)] text-lg backdrop-blur transition hover:border-[var(--line-strong)] disabled:opacity-0"
      >
        ‹
      </button>
      <button
        onClick={() => goTo(index + 1)}
        disabled={index === photos.length - 1}
        aria-label="Next photo"
        className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-[var(--line)] bg-[rgb(10_10_12/0.7)] text-lg backdrop-blur transition hover:border-[var(--line-strong)] disabled:opacity-0"
      >
        ›
      </button>

      <div className="mt-3 flex items-center justify-between gap-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
          {photos[index]?.caption}
        </p>
        <div className="flex gap-1.5">
          {photos.map((p, i) => (
            <button
              key={p.src}
              onClick={() => goTo(i)}
              aria-label={`Photo ${i + 1}`}
              aria-current={i === index}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: i === index ? 18 : 6,
                background: i === index ? "var(--accent)" : "rgb(255 255 255 / 0.25)",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
