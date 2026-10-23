import Image from "next/image";
import { athlete, reach } from "@/content/site";
import { compact } from "@/lib/format";

/**
 * Says who the suit belongs to, and opens the About dialog.
 *
 * A square card rather than the old pill: a sponsor needs to see whose body
 * they would be buying before anything else on the page matters, and the pill
 * read as a footer credit. It shrinks on phones, where ~180px of a small
 * screen would crowd the suit.
 */
export function AthleteBadge({
  avatar,
  onClick,
}: {
  avatar?: string | null;
  onClick?: () => void;
}) {
  const followers = reach.stats.find((s) => s.label === "Instagram")?.value ?? 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`About ${athlete.name}`}
      className="group flex aspect-square w-[8.25rem] flex-col items-center justify-center gap-1.5 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-3 text-center backdrop-blur transition hover:border-[var(--line-strong)] hover:bg-[rgb(22_22_26/0.92)] sm:w-[11.5rem] sm:gap-1.5 sm:p-3"
    >
      {avatar ? (
        <Image
          src={avatar}
          alt=""
          width={176}
          height={176}
          className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-[var(--accent)] sm:h-16 sm:w-16"
        />
      ) : (
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-[var(--accent)] bg-[rgb(255_212_0/0.1)] font-mono text-sm text-[var(--accent)] sm:h-16 sm:w-16 sm:text-lg"
          aria-hidden
        >
          PG
        </span>
      )}

      <span className="min-w-0 leading-tight">
        <span className="block truncate text-xs font-bold text-[var(--ink)] sm:text-sm">
          {athlete.name}
        </span>
        <span className="mt-0.5 block truncate font-mono text-[9px] uppercase tracking-[0.06em] text-[var(--ink-faint)] sm:text-[10px]">
          {athlete.handle}
        </span>
        {followers > 0 && (
          <span className="mt-0.5 block font-mono text-[10px] text-[var(--ink-dim)] sm:text-[11px]">
            {compact(followers)} followers
          </span>
        )}
      </span>

      <span className="w-full rounded-lg border border-[var(--line-strong)] px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)] transition group-hover:bg-[rgb(255_212_0/0.12)] sm:text-[10px]">
        About ↗
      </span>
    </button>
  );
}
