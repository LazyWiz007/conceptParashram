import { Studio } from "@/components/Studio";
import { RaceSection } from "@/components/sections/RaceSection";
import { ReachSection } from "@/components/sections/ReachSection";
import { DocumentarySection } from "@/components/sections/DocumentarySection";
import { TiersSection } from "@/components/sections/TiersSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { athlete, race } from "@/content/site";
import { findAvatar } from "@/lib/photos";

export default async function Home() {
  const avatar = await findAvatar();

  return (
    <main>
      <Studio avatar={avatar} />
      <RaceSection />
      <ReachSection />
      <DocumentarySection />
      <TiersSection />
      <FaqSection />
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
