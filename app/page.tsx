import { Studio } from "@/components/Studio";
import { AboutSection } from "@/components/sections/AboutSection";
import { ReachSection } from "@/components/sections/ReachSection";
import { DocumentarySection } from "@/components/sections/DocumentarySection";
import { TiersSection } from "@/components/sections/TiersSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { CtaSection } from "@/components/sections/CtaSection";
import { athlete, race } from "@/content/site";
import { findAvatar } from "@/lib/photos";
import { readSlots } from "@/lib/slotStore";

// slots are editable in /admin, so this page cannot be baked at build time
export const dynamic = "force-dynamic";

export default async function Home() {
  const [avatar, slots] = await Promise.all([findAvatar(), readSlots()]);

  return (
    <main>
      <Studio slots={slots} avatar={avatar} />
      <AboutSection />
      <ReachSection />
      <DocumentarySection />
      <TiersSection />
      <FaqSection />
      <CtaSection slotsLeft={slots.filter((s) => s.status === "open").length} />
      <footer className="border-t border-[var(--line)] px-5 py-10 sm:px-8">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-[var(--ink-faint)]">
          <span>
            {athlete.name} · {race.name}
          </span>
          <a href="#top" className="transition hover:text-[var(--ink)]">
            Back to the suit ↑
          </a>
        </div>
      </footer>
    </main>
  );
}
