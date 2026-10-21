import { race } from "@/content/site";
import { Countdown } from "@/components/panels/Countdown";
import { openSlotCount } from "@/content/slots";

/**
 * The last thing on the page. Someone who has read this far has decided; they
 * should not have to scroll back up hunting for the suit.
 */
export function CtaSection({ slotsLeft }: { slotsLeft?: number }) {
  const left = slotsLeft ?? openSlotCount();

  return (
    <section
      id="sponsor"
      className="relative overflow-hidden border-t border-[var(--line)] px-5 py-24 text-center sm:px-8 sm:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(60% 70% at 50% 100%, rgb(255 212 0 / 0.16) 0%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-3xl">
        <h2 className="text-balance text-[2.4rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Sponsor the trisuit
        </h2>

        <p className="mx-auto mt-5 max-w-[46ch] text-lg leading-relaxed text-[var(--ink-dim)]">
          {left} {left === 1 ? "place is" : "places are"} still open on the suit I race{" "}
          {race.name} in.
        </p>

        {race.dateConfirmed && (
          <div className="mt-8 flex justify-center">
            <Countdown iso={race.date} />
          </div>
        )}

        <a
          href="#top"
          className="mt-10 inline-block rounded-full bg-[var(--accent)] px-9 py-4 text-base font-semibold text-[#111] transition hover:brightness-110 sm:text-lg"
        >
          Get your logo on the trisuit
        </a>

        <p className="mt-5 text-sm text-[var(--ink-faint)]">
          Pick a place on the suit, send an enquiry. No payment online.
        </p>
      </div>
    </section>
  );
}
