"use client";

import { useState } from "react";
import { SLOTS } from "@/content/slots";
import type { ViewId } from "@/lib/types";
import { Chamber } from "./suit/Chamber";
import { SuitStage } from "./suit/SuitStage";

export function Studio() {
  const [view, setView] = useState<ViewId>("front");
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <section className="relative h-[100svh] w-full overflow-hidden">
      <Chamber />
      <div className="absolute inset-0 px-4 pb-14 pt-8 sm:pb-16 sm:pt-10">
        <SuitStage
          slots={SLOTS}
          view={view}
          setView={setView}
          focusedId={focusedId}
          setFocusedId={setFocusedId}
          hoveredId={hoveredId}
          setHoveredId={setHoveredId}
        />
      </div>
    </section>
  );
}
