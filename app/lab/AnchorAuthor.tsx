"use client";

import { useEffect, useMemo, useState } from "react";
import { SLOTS } from "@/content/slots";
import { TIER_HEX } from "@/lib/tierColors";
import { cameraForAnchor } from "@/lib/slotCamera";
import { Stage3D } from "@/components/suit/three/Stage3D";
import type { Anchor } from "@/components/suit/three/anchorMath";
import { HOME, type CameraMove } from "@/components/suit/three/CameraRig";
import type { Slot } from "@/lib/types";

const STORE = "trisuit-anchors";

/** Default projector box per tier — roughly the printed size on the real suit. */
const TIER_SIZE: Record<string, [number, number, number]> = {
  title: [0.62, 0.26, 0.7],
  prime: [0.36, 0.3, 0.7],
  core: [0.26, 0.22, 0.7],
  support: [0.22, 0.26, 0.7],
};

const VIEWS: Record<string, CameraMove> = {
  front: HOME,
  right: { position: [7.2, 0.3, 0], target: [0, -0.2, 0] },
  back: { position: [0, 0.3, -7.2], target: [0, -0.2, 0] },
  left: { position: [-7.2, 0.3, 0], target: [0, -0.2, 0] },
};

/**
 * Dev tool. Click the suit to drop a slot anchor there — the raycast gives both
 * the point and the surface normal, which is the whole projector transform.
 * Starts from whatever is already baked into content/slots.ts.
 */
export function AnchorAuthor() {
  const baked = useMemo(
    () => Object.fromEntries(SLOTS.map((s) => [s.id, s.anchor as Anchor])),
    [],
  );
  const [placed, setPlaced] = useState<Record<string, Anchor>>(baked);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState<string>(SLOTS[0].id);
  const [spin, setSpin] = useState(0);
  const [move, setMove] = useState<CameraMove | null>(HOME);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE);
      if (raw) setPlaced({ ...baked, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, [baked]);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORE, JSON.stringify(placed));
    } catch {
      /* ignore */
    }
  }, [placed, loaded]);

  const slots: Slot[] = SLOTS.map((s) => ({ ...s, anchor: placed[s.id] ?? s.anchor }));
  const activeSlot = SLOTS.find((s) => s.id === active)!;
  const json = JSON.stringify(placed, null, 2);

  return (
    <div className="flex h-[100svh] w-full">
      <aside className="flex w-72 shrink-0 flex-col border-r border-[var(--line)] bg-[rgb(4_11_18/0.9)]">
        <header className="border-b border-[var(--line)] px-4 py-3">
          <h1 className="text-sm font-semibold">Slot anchors</h1>
          <p className="mt-1 text-xs text-[var(--ink-dim)]">
            Pick a slot, then click that spot on the suit to move it.
          </p>
          <label className="mt-3 block">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
              Spin {Math.round((spin * 180) / Math.PI)}°
            </span>
            <input
              type="range"
              min={-180}
              max={180}
              value={Math.round((spin * 180) / Math.PI)}
              onChange={(e) => setSpin((Number(e.target.value) * Math.PI) / 180)}
              className="w-full"
            />
          </label>
        </header>

        <ul className="scroll-slim flex-1 overflow-y-auto">
          {SLOTS.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => {
                  setActive(s.id);
                  setMove(cameraForAnchor(placed[s.id] ?? s.anchor));
                }}
                className={`flex w-full items-center gap-2 px-4 py-2 text-left text-xs transition ${
                  active === s.id ? "bg-[rgb(56_189_248/0.14)]" : "hover:bg-[rgb(56_189_248/0.06)]"
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: TIER_HEX[s.tier] }} />
                {s.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="border-t border-[var(--line)] p-3">
          <button
            onClick={() => navigator.clipboard.writeText(json)}
            className="w-full rounded-lg bg-[var(--tier-prime)] px-3 py-2 text-xs font-semibold text-[#03131c]"
          >
            Copy JSON
          </button>
          <button
            onClick={() => {
              setPlaced(baked);
              try {
                localStorage.removeItem(STORE);
              } catch {
                /* ignore */
              }
            }}
            className="mt-2 w-full rounded-lg border border-[var(--line)] px-3 py-2 text-xs text-[var(--ink-dim)]"
          >
            Reset to baked
          </button>
          <textarea
            readOnly
            value={json}
            className="scroll-slim mt-2 h-28 w-full rounded-lg border border-[var(--line)] bg-[rgb(3_10_18/0.6)] p-2 font-mono text-[10px] text-[var(--ink-dim)]"
          />
        </div>
      </aside>

      <div className="relative flex-1">
        <Stage3D
          slots={slots}
          move={move}
          hoveredId={active}
          onPlace={(a) => setPlaced((p) => ({ ...p, [active]: a }))}
          spin={spin}
          placementSize={TIER_SIZE[activeSlot.tier]}
        />
        <p className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] backdrop-blur">
          placing: {activeSlot.label}
        </p>
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1 rounded-full border border-[var(--line)] bg-[var(--panel)] p-1 backdrop-blur">
          {Object.keys(VIEWS).map((v) => (
            <button
              key={v}
              onClick={() => setMove(VIEWS[v])}
              className="rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-dim)] transition hover:text-[var(--ink)]"
            >
              {v}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
