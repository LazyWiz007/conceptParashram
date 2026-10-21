"use client";

import dynamicImport from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { TIERS } from "@/content/slots";
import { TIER_HEX } from "@/lib/tierColors";
import { cameraForAnchor } from "@/lib/slotCamera";
import { inr } from "@/lib/format";
import { HOME, type CameraMove } from "@/components/suit/three/CameraRig";
import type { Anchor } from "@/components/suit/three/anchorMath";
import type { Slot, TierId } from "@/lib/types";

const Stage3D = dynamicImport(
  () => import("@/components/suit/three/Stage3D").then((m) => m.Stage3D),
  { ssr: false },
);

const VIEWS: Record<string, CameraMove> = {
  front: HOME,
  right: { position: [7.2, 0.3, 0], target: [0, -0.2, 0] },
  back: { position: [0, 0.3, -7.2], target: [0, -0.2, 0] },
  left: { position: [-7.2, 0.3, 0], target: [0, -0.2, 0] },
};

type Save = "idle" | "saving" | "saved" | "error";

export function AdminSlots({ initial, persistent }: { initial: Slot[]; persistent: boolean }) {
  const [slots, setSlots] = useState<Slot[]>(initial);
  const [activeId, setActiveId] = useState<string>(initial[0]?.id ?? "");
  const [move, setMove] = useState<CameraMove | null>(HOME);
  const [spin, setSpin] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [save, setSave] = useState<Save>("idle");
  const [error, setError] = useState<string | null>(null);

  const active = slots.find((s) => s.id === activeId) ?? null;

  const patch = useCallback(
    (id: string, fn: (s: Slot) => Slot) =>
      setSlots((list) => list.map((s) => (s.id === id ? fn(s) : s))),
    [],
  );

  const setAnchor = useCallback(
    (id: string, fn: (a: Slot["anchor"]) => Slot["anchor"]) =>
      patch(id, (s) => ({ ...s, anchor: fn(s.anchor) })),
    [patch],
  );

  function onPlace(a: Anchor) {
    if (!active || !placing) return;
    // keep the slot's own size; the click only decides where and which way
    setAnchor(active.id, (old) => ({ ...old, position: a.position, rotation: a.rotation }));
    setPlacing(false);
  }

  function addSlot() {
    const n = slots.length + 1;
    const id = `slot_${n}_${Math.random().toString(36).slice(2, 6)}`;
    const fresh: Slot = {
      id,
      label: `New slot ${n}`,
      tier: "core",
      price: 75000,
      status: "open",
      pitch: "",
      size: "",
      anchor: { position: [0, 0.2, 0.42], rotation: [0, 0, 0], size: [0.28, 0.2, 0.8] },
    };
    setSlots((l) => [...l, fresh]);
    setActiveId(id);
    setPlacing(true);
  }

  function removeSlot(id: string) {
    setSlots((l) => l.filter((s) => s.id !== id));
    setActiveId((cur) => (cur === id ? (slots.find((s) => s.id !== id)?.id ?? "") : cur));
  }

  async function uploadLogo(file: File) {
    if (!active) return;
    const fd = new FormData();
    fd.append("logo", file);
    const res = await fetch("/api/admin/logo", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Upload failed");
      return;
    }
    patch(active.id, (s) => ({
      ...s,
      sponsor: { name: "", ...s.sponsor, logo: data.url as string },
    }));
  }

  async function persist() {
    setSave("saving");
    setError(null);
    try {
      const res = await fetch("/api/admin/slots", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slots }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      setSave("saved");
      setTimeout(() => setSave("idle"), 2500);
    } catch (e) {
      setSave("error");
      setError(e instanceof Error ? e.message : "Save failed");
    }
  }

  const byTier = useMemo(() => {
    const order = TIERS.map((t) => t.id);
    return [...slots].sort(
      (a, b) => order.indexOf(a.tier) - order.indexOf(b.tier) || a.label.localeCompare(b.label),
    );
  }, [slots]);

  return (
    <div className="flex h-[100svh] w-full flex-col lg:flex-row">
      {/* list */}
      <aside className="flex w-full shrink-0 flex-col border-b border-[var(--line)] bg-[rgb(4_11_18/0.9)] lg:w-64 lg:border-b-0 lg:border-r">
        <header className="flex items-center justify-between gap-2 border-b border-[var(--line)] px-4 py-3">
          <div>
            <h1 className="text-sm font-semibold">Slots</h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
              {slots.length} total
            </p>
          </div>
          <button
            onClick={addSlot}
            className="rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs text-[var(--ink-dim)] transition hover:text-[var(--ink)]"
          >
            + Add
          </button>
        </header>

        <ul className="scroll-slim max-h-56 flex-1 overflow-y-auto lg:max-h-none">
          {byTier.map((s) => (
            <li key={s.id}>
              <button
                onClick={() => {
                  setActiveId(s.id);
                  setMove(cameraForAnchor(s.anchor));
                }}
                className={`flex w-full items-center gap-2 px-4 py-2 text-left text-xs transition ${
                  activeId === s.id ? "bg-[rgb(56_189_248/0.14)]" : "hover:bg-[rgb(56_189_248/0.06)]"
                }`}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: TIER_HEX[s.tier] }}
                />
                <span className="flex-1 truncate">{s.label}</span>
                {s.status !== "open" && (
                  <span className="font-mono text-[9px] uppercase text-[var(--ink-faint)]">sold</span>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="space-y-2 border-t border-[var(--line)] p-3">
          {error && <p className="text-xs text-red-400">{error}</p>}
          {!persistent && (
            <p className="text-[10px] leading-snug text-amber-300/80">
              Saving to a local file. Set SUPABASE_URL to keep edits across deploys.
            </p>
          )}
          <button
            onClick={persist}
            disabled={save === "saving"}
            className="w-full rounded-lg bg-[var(--tier-prime)] px-3 py-2 text-xs font-semibold text-[#03131c] disabled:opacity-50"
          >
            {save === "saving" ? "Saving…" : save === "saved" ? "Saved ✓" : "Save changes"}
          </button>
          <a
            href="/admin"
            className="block text-center text-[11px] text-[var(--ink-faint)] hover:text-[var(--ink)]"
          >
            ← Enquiries
          </a>
        </div>
      </aside>

      {/* viewport */}
      <div className="relative min-h-[18rem] flex-1">
        <Stage3D
          slots={slots}
          move={move}
          focusedId={activeId}
          hoveredId={activeId}
          onSelect={(id) => {
            setActiveId(id);
            setMove(cameraForAnchor(slots.find((s) => s.id === id)!.anchor));
          }}
          onPlace={placing ? onPlace : undefined}
          spin={spin}
          placementSize={active?.anchor.size}
        />

        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
          <p
            className={`rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] backdrop-blur ${
              placing
                ? "border-[var(--tier-title)] bg-[rgb(217_240_60/0.15)] text-[var(--tier-title)]"
                : "border-[var(--line)] bg-[var(--panel)] text-[var(--ink-dim)]"
            }`}
          >
            {placing ? "click the suit to place" : (active?.label ?? "no slot selected")}
          </p>
        </div>

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

      {/* inspector */}
      <aside className="scroll-slim w-full shrink-0 overflow-y-auto border-t border-[var(--line)] bg-[rgb(4_11_18/0.9)] p-4 lg:w-80 lg:border-l lg:border-t-0">
        {!active ? (
          <p className="text-xs text-[var(--ink-faint)]">Pick a slot.</p>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{active.label}</h2>
              <button
                onClick={() => removeSlot(active.id)}
                className="text-[11px] text-red-400/80 hover:text-red-400"
              >
                Delete
              </button>
            </div>

            <button
              onClick={() => setPlacing((p) => !p)}
              className={`w-full rounded-lg border px-3 py-2 text-xs transition ${
                placing
                  ? "border-[var(--tier-title)] text-[var(--tier-title)]"
                  : "border-[var(--line)] text-[var(--ink-dim)] hover:text-[var(--ink)]"
              }`}
            >
              {placing ? "Cancel placing" : "Move — click the suit"}
            </button>

            <Field label="Name">
              <input
                value={active.label}
                onChange={(e) => patch(active.id, (s) => ({ ...s, label: e.target.value }))}
                className={INPUT}
              />
            </Field>

            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Tier">
                <select
                  value={active.tier}
                  onChange={(e) =>
                    patch(active.id, (s) => ({ ...s, tier: e.target.value as TierId }))
                  }
                  className={INPUT}
                >
                  {TIERS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={`Price (${inr(active.price)})`}>
                <input
                  type="number"
                  value={active.price}
                  onChange={(e) =>
                    patch(active.id, (s) => ({ ...s, price: Number(e.target.value) || 0 }))
                  }
                  className={INPUT}
                />
              </Field>
            </div>

            <Slider
              label="Width"
              value={active.anchor.size[0]}
              min={0.08}
              max={1.1}
              onChange={(v) =>
                setAnchor(active.id, (a) => ({ ...a, size: [v, a.size[1], a.size[2]] }))
              }
            />
            <Slider
              label="Height"
              value={active.anchor.size[1]}
              min={0.06}
              max={0.9}
              onChange={(v) =>
                setAnchor(active.id, (a) => ({ ...a, size: [a.size[0], v, a.size[2]] }))
              }
            />
            <Slider
              label="Rotate"
              value={spin}
              min={-Math.PI}
              max={Math.PI}
              suffix="°"
              display={(v) => Math.round((v * 180) / Math.PI)}
              onChange={setSpin}
              hint="Rotation applies on the next placement click"
            />

            <Field label="Printed size (shown to sponsors)">
              <input
                value={active.size}
                placeholder="22 × 9 cm"
                onChange={(e) => patch(active.id, (s) => ({ ...s, size: e.target.value }))}
                className={INPUT}
              />
            </Field>

            <Field label="Pitch">
              <textarea
                rows={3}
                value={active.pitch}
                onChange={(e) => patch(active.id, (s) => ({ ...s, pitch: e.target.value }))}
                className={INPUT}
              />
            </Field>

            <div className="border-t border-[var(--line)] pt-4">
              <Field label="Status">
                <select
                  value={active.status}
                  onChange={(e) =>
                    patch(active.id, (s) => ({
                      ...s,
                      status: e.target.value as Slot["status"],
                      sponsor:
                        e.target.value === "open"
                          ? s.sponsor
                          : (s.sponsor ?? { name: "", logo: null }),
                    }))
                  }
                  className={INPUT}
                >
                  <option value="open">Open</option>
                  <option value="pending">On hold</option>
                  <option value="sold">Sold</option>
                </select>
              </Field>

              {active.status !== "open" && (
                <div className="mt-3 space-y-3">
                  <Field label="Sponsor name">
                    <input
                      value={active.sponsor?.name ?? ""}
                      onChange={(e) =>
                        patch(active.id, (s) => ({
                          ...s,
                          sponsor: { logo: null, ...s.sponsor, name: e.target.value },
                        }))
                      }
                      className={INPUT}
                    />
                  </Field>
                  <Field label="Handle">
                    <input
                      value={active.sponsor?.handle ?? ""}
                      placeholder="@brand"
                      onChange={(e) =>
                        patch(active.id, (s) => ({
                          ...s,
                          sponsor: { name: "", logo: null, ...s.sponsor, handle: e.target.value },
                        }))
                      }
                      className={INPUT}
                    />
                  </Field>
                  <Field label="Tagline">
                    <input
                      value={active.sponsor?.tagline ?? ""}
                      onChange={(e) =>
                        patch(active.id, (s) => ({
                          ...s,
                          sponsor: { name: "", logo: null, ...s.sponsor, tagline: e.target.value },
                        }))
                      }
                      className={INPUT}
                    />
                  </Field>
                  <Field label="Website">
                    <input
                      value={active.sponsor?.url ?? ""}
                      placeholder="https://"
                      onChange={(e) =>
                        patch(active.id, (s) => ({
                          ...s,
                          sponsor: { name: "", logo: null, ...s.sponsor, url: e.target.value },
                        }))
                      }
                      className={INPUT}
                    />
                  </Field>
                  <Field label="Brand colour">
                    <input
                      type="color"
                      value={active.sponsor?.color ?? "#d9f03c"}
                      onChange={(e) =>
                        patch(active.id, (s) => ({
                          ...s,
                          sponsor: { name: "", logo: null, ...s.sponsor, color: e.target.value },
                        }))
                      }
                      className="h-9 w-full rounded-lg border border-[var(--line)] bg-transparent"
                    />
                  </Field>
                  <Field label="Logo">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) uploadLogo(f);
                      }}
                      className="w-full text-[11px] text-[var(--ink-dim)] file:mr-2 file:rounded-md file:border-0 file:bg-[rgb(56_189_248/0.15)] file:px-2 file:py-1 file:text-[11px] file:text-[var(--ink)]"
                    />
                    {active.sponsor?.logo && (
                      <p className="mt-1 truncate font-mono text-[10px] text-[var(--ink-faint)]">
                        {active.sponsor.logo}
                      </p>
                    )}
                  </Field>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

const INPUT =
  "w-full rounded-lg border border-[var(--line)] bg-[rgb(3_10_18/0.6)] px-2.5 py-1.5 text-xs text-[var(--ink)] outline-none focus:border-[var(--line-strong)]";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
        {label}
      </span>
      {children}
    </label>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  onChange,
  display,
  suffix = "",
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  display?: (v: number) => number | string;
  suffix?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--ink-faint)]">
        {label}
        <span className="text-[var(--ink-dim)]">
          {display ? display(value) : value.toFixed(2)}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={(max - min) / 200}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full"
      />
      {hint && <span className="mt-0.5 block text-[10px] text-[var(--ink-faint)]">{hint}</span>}
    </label>
  );
}
