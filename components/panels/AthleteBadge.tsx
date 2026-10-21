import Image from "next/image";
import { athlete, reach } from "@/content/site";
import { compact } from "@/lib/format";

/**
 * Says who the suit belongs to. Without this the page is an anonymous object in
 * a room — a sponsor has no idea whose body they would be buying.
 */
export function AthleteBadge({ avatar }: { avatar?: string | null }) {
  const followers = reach.stats.find((s) => s.label === "Instagram")?.value ?? 0;

  return (
    <a
      href={athlete.instagram}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-2.5 rounded-full border border-[var(--line)] bg-[var(--panel)] py-1.5 pl-1.5 pr-3.5 backdrop-blur transition hover:border-[var(--line-strong)]"
    >
      {avatar ? (
        <Image
          src={avatar}
          alt=""
          width={36}
          height={36}
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[rgb(255_255_255/0.1)] font-mono text-xs text-[var(--accent)]"
          aria-hidden
        >
          PG
        </span>
      )}

      <span className="min-w-0 leading-tight">
        <span className="block truncate text-[13px] font-semibold text-[var(--ink)]">
          {athlete.name}
        </span>
        <span className="block truncate font-mono text-[10px] uppercase tracking-[0.1em] text-[var(--ink-faint)]">
          {athlete.handle}
          {followers > 0 && (
            <span className="ml-1.5 text-[var(--ink-dim)]">{compact(followers)} followers</span>
          )}
          <span className="ml-1.5 opacity-0 transition group-hover:opacity-100">↗</span>
        </span>
      </span>
    </a>
  );
}
