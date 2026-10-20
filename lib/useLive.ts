"use client";

import { useEffect, useRef, useState } from "react";

export type Activity = {
  active: number;
  visitorsToday: number;
  events: { id: string; country: string; isNew: boolean; seenAt: string }[];
};

export function useSlotViews() {
  const [views, setViews] = useState<Record<string, number>>({});
  useEffect(() => {
    let alive = true;
    fetch("/api/slot-views")
      .then((r) => r.json())
      .then((d) => alive && setViews(d.bySlot ?? {}))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return views;
}

export function useActivity(intervalMs = 20_000) {
  const [activity, setActivity] = useState<Activity | null>(null);
  useEffect(() => {
    let alive = true;
    const tick = () =>
      fetch("/api/activity")
        .then((r) => r.json())
        .then((d) => alive && setActivity(d))
        .catch(() => {});
    tick();
    const id = setInterval(tick, intervalMs);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [intervalMs]);
  return activity;
}

/** Count a slot as viewed once per session, half a second after it is opened. */
export function useTrackSlotView(slotId: string | null) {
  const sent = useRef(new Set<string>());
  useEffect(() => {
    if (!slotId || sent.current.has(slotId)) return;
    const t = setTimeout(() => {
      sent.current.add(slotId);
      fetch("/api/slot-view", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slotId }),
      }).catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [slotId]);
}

export function useCountdown(iso: string) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const target = new Date(iso).getTime();
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [iso]);

  if (left === null) return null; // avoids a hydration mismatch
  const s = Math.floor(left / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
    done: left === 0,
  };
}
