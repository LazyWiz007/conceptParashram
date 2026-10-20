"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { quadBounds, quadCentroid, svgPolygonPoints } from "@/lib/geometry";
import { useSize } from "@/lib/useSize";
import { VIEW_ORDER, type Slot, type ViewId } from "@/lib/types";
import { SlotDecal } from "./SlotDecal";
import { SlotMarker } from "./SlotMarker";

const PLATE_W = 940;
const PLATE_H = 1380;
const DRAG_STEP = 54; // px of drag per quarter turn

export function SuitStage({
  slots,
  view,
  setView,
  focusedId,
  setFocusedId,
  hoveredId,
  setHoveredId,
}: {
  slots: Slot[];
  view: ViewId;
  setView: (v: ViewId) => void;
  focusedId: string | null;
  setFocusedId: (id: string | null) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
}) {
  const [plateRef, size] = useSize<HTMLDivElement>();
  const drag = useRef<{ x: number; active: boolean; moved: boolean }>({
    x: 0,
    active: false,
    moved: false,
  });

  const index = VIEW_ORDER.indexOf(view);
  const focused = focusedId ? slots.find((s) => s.id === focusedId) ?? null : null;

  const step = useCallback(
    (delta: number) => {
      const next = Math.min(VIEW_ORDER.length - 1, Math.max(0, index + delta));
      if (next !== index) setView(VIEW_ORDER[next]);
    },
    [index, setView],
  );

  // slots visible in the current view
  const visible = useMemo(
    () => slots.filter((s) => s.placement[view]),
    [slots, view],
  );

  // camera: centre and scale onto the focused slot
  const camera = useMemo(() => {
    const quad = focused?.placement[view];
    if (!focused || !quad) return { scale: 1, x: "0%", y: "0%" };
    const [cx, cy] = quadCentroid(quad);
    const [, , , qh] = quadBounds(quad);
    const scale = Math.min(3.4, Math.max(1.7, 0.42 / Math.max(qh, 0.04)));
    return {
      scale,
      x: `${(-(cx - 0.5) * 100 * scale).toFixed(2)}%`,
      y: `${(-(cy - 0.5) * 100 * scale).toFixed(2)}%`,
    };
  }, [focused, view]);

  // focusing a slot rotates to the view that shows it best
  useEffect(() => {
    if (focused && !focused.placement[view]) setView(focused.bestView);
  }, [focused, view, setView]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFocusedId(null);
      if (focusedId) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusedId, step, setFocusedId]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (focusedId) return;
    drag.current = { x: e.clientX, active: true, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.x;
    if (Math.abs(dx) >= DRAG_STEP) {
      step(dx < 0 ? 1 : -1);
      drag.current.x = e.clientX;
      drag.current.moved = true;
    }
  };

  const endDrag = (e: React.PointerEvent) => {
    drag.current.active = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already gone */
    }
  };

  const { width: w, height: h } = size;

  return (
    <div className="relative h-full w-full select-none">
      <motion.div
        className="absolute inset-0 grid place-items-center"
        animate={camera}
        transition={{ type: "spring", stiffness: 160, damping: 26, mass: 0.9 }}
      >
        <div
          ref={plateRef}
          className="relative h-full touch-pan-y"
          style={{ aspectRatio: `${PLATE_W} / ${PLATE_H}`, cursor: focusedId ? "default" : "ew-resize" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {/* stacked views — only the active one is opaque */}
          {VIEW_ORDER.map((v) => (
            <Image
              key={v}
              src={`/suit/${v}.webp`}
              alt={v === view ? `Trisuit, ${v.replace("-", " ")} view` : ""}
              fill
              priority={v === "front"}
              sizes="(max-width: 768px) 90vw, 46vw"
              className="object-contain transition-opacity duration-200 ease-out"
              style={{ opacity: v === view ? 1 : 0 }}
              draggable={false}
              unoptimized
            />
          ))}

          {/* reflection on the chamber floor (background image: keeps it out of LCP) */}
          <div
            className="suit-reflection"
            style={{
              backgroundImage: `url(/suit/${view}.webp)`,
              backgroundSize: "contain",
              backgroundPosition: "top center",
              backgroundRepeat: "no-repeat",
            }}
            aria-hidden
          />

          {/* logos, warped onto the fabric */}
          <div className="decal-layer">
            {visible.map((s) => (
              <SlotDecal
                key={s.id}
                slot={s}
                quad={s.placement[view]!}
                width={w}
                height={h}
                dimmed={Boolean(focusedId) && focusedId !== s.id}
                active={focusedId === s.id || hoveredId === s.id}
              />
            ))}
          </div>

          {/* selection outline for the active slot only */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${w || PLATE_W} ${h || PLATE_H}`}
            aria-hidden
          >
            {visible.map((s) => {
              const isOn = focusedId === s.id || hoveredId === s.id;
              if (!isOn) return null;
              return (
                <polygon
                  key={s.id}
                  points={svgPolygonPoints(s.placement[view]!, w || PLATE_W, h || PLATE_H)}
                  fill="transparent"
                  stroke={`var(--tier-${s.tier})`}
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                />
              );
            })}
          </svg>

          {/* markers take the pointer */}
          {visible.map((s) => (
            <SlotMarker
              key={s.id}
              slot={s}
              quad={s.placement[view]!}
              active={focusedId === s.id || hoveredId === s.id}
              dimmed={Boolean(focusedId) && focusedId !== s.id}
              onEnter={() => setHoveredId(s.id)}
              onLeave={() => setHoveredId(null)}
              onSelect={() => {
                if (drag.current.moved) {
                  drag.current.moved = false;
                  return;
                }
                setFocusedId(focusedId === s.id ? null : s.id);
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* rotate control */}
      <div
        className={`pointer-events-auto absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--panel)] px-1.5 py-1.5 backdrop-blur transition-opacity ${
          focusedId ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <StepButton onClick={() => step(-1)} disabled={index === 0} label="Rotate left">
          ‹
        </StepButton>
        <div className="flex items-center gap-1 px-1">
          {VIEW_ORDER.map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-label={`${v.replace("-", " ")} view`}
              aria-current={v === view}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: v === view ? 18 : 6,
                background: v === view ? "var(--tier-prime)" : "rgb(56 189 248 / 0.3)",
              }}
            />
          ))}
        </div>
        <StepButton onClick={() => step(1)} disabled={index === VIEW_ORDER.length - 1} label="Rotate right">
          ›
        </StepButton>
      </div>
    </div>
  );
}

function StepButton({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="grid h-7 w-7 place-items-center rounded-full text-lg leading-none text-[var(--ink-dim)] transition hover:bg-[rgb(56_189_248/0.12)] hover:text-[var(--ink)] disabled:opacity-25 disabled:hover:bg-transparent"
    >
      {children}
    </button>
  );
}
