import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Storage degrades gracefully: with Supabase env vars set we persist, without
 * them we keep everything in process memory so the site runs with zero config.
 * The in-memory store resets on every deploy — it is for local work only.
 */
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

let client: SupabaseClient | null = null;
export const hasDb = Boolean(url && key);

export function db(): SupabaseClient | null {
  if (!hasDb) return null;
  client ??= createClient(url!, key!, { auth: { persistSession: false } });
  return client;
}

/* ---------------- in-memory fallback ---------------- */

type VisitorEvent = { id: string; country: string; seenAt: string; isNew: boolean };

type MemStore = {
  slotViews: Map<string, number>;
  visitors: VisitorEvent[];
  seen: Set<string>;
  enquiries: Record<string, unknown>[];
};

/**
 * Hung off globalThis so it survives HMR re-evaluating this module in dev.
 * It still does not survive a restart, and on serverless each instance gets
 * its own copy — which is exactly why this is a local-only fallback.
 */
const g = globalThis as typeof globalThis & { __smtMem?: MemStore };
const mem: MemStore = (g.__smtMem ??= {
  slotViews: new Map<string, number>(),
  visitors: [],
  seen: new Set<string>(),
  enquiries: [],
});

/* ---------------- slot views ---------------- */

export async function bumpSlotView(slotId: string): Promise<void> {
  const sb = db();
  if (!sb) {
    mem.slotViews.set(slotId, (mem.slotViews.get(slotId) ?? 0) + 1);
    return;
  }
  // increment_slot_view is a Postgres function; see supabase/schema.sql
  await sb.rpc("increment_slot_view", { p_slot_id: slotId });
}

export async function readSlotViews(): Promise<Record<string, number>> {
  const sb = db();
  if (!sb) return Object.fromEntries(mem.slotViews);
  const { data, error } = await sb.from("slot_views").select("slot_id, count");
  if (error || !data) return {};
  return Object.fromEntries(data.map((r) => [r.slot_id as string, Number(r.count)]));
}

/* ---------------- visitors ---------------- */

export async function recordVisit(visitorHash: string, country: string): Promise<void> {
  const sb = db();
  if (!sb) {
    const isNew = !mem.seen.has(visitorHash);
    mem.seen.add(visitorHash);
    mem.visitors = [
      { id: visitorHash, country, seenAt: new Date().toISOString(), isNew },
      ...mem.visitors.filter((v) => v.id !== visitorHash),
    ].slice(0, 50);
    return;
  }
  await sb.from("visitor_events").upsert(
    { visitor_hash: visitorHash, country, seen_at: new Date().toISOString() },
    { onConflict: "visitor_hash" },
  );
}

export type Activity = {
  active: number;
  visitorsToday: number;
  events: { id: string; country: string; isNew: boolean; seenAt: string }[];
  asOf: string;
};

export async function readActivity(): Promise<Activity> {
  const now = Date.now();
  const fiveMinAgo = new Date(now - 5 * 60_000).toISOString();
  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const sb = db();
  if (!sb) {
    return {
      active: mem.visitors.filter((v) => v.seenAt >= fiveMinAgo).length,
      visitorsToday: mem.visitors.filter((v) => v.seenAt >= startOfDay).length,
      events: mem.visitors.slice(0, 5),
      asOf: new Date(now).toISOString(),
    };
  }

  const [recent, today, active] = await Promise.all([
    sb.from("visitor_events").select("visitor_hash, country, seen_at, created_at")
      .order("seen_at", { ascending: false }).limit(5),
    sb.from("visitor_events").select("visitor_hash", { count: "exact", head: true })
      .gte("seen_at", startOfDay),
    sb.from("visitor_events").select("visitor_hash", { count: "exact", head: true })
      .gte("seen_at", fiveMinAgo),
  ]);

  return {
    active: active.count ?? 0,
    visitorsToday: today.count ?? 0,
    events: (recent.data ?? []).map((r) => ({
      id: String(r.visitor_hash),
      country: String(r.country ?? "").toUpperCase(),
      isNew: String(r.created_at ?? "") >= startOfDay,
      seenAt: String(r.seen_at),
    })),
    asOf: new Date(now).toISOString(),
  };
}

/* ---------------- enquiries ---------------- */

export type EnquiryRow = {
  slot_id: string;
  company: string;
  contact: string;
  email: string;
  phone: string | null;
  website: string | null;
  message: string | null;
};

export async function saveEnquiry(row: EnquiryRow): Promise<void> {
  const sb = db();
  if (!sb) {
    mem.enquiries.push({ ...row, created_at: new Date().toISOString() });
    return;
  }
  const { error } = await sb.from("enquiries").insert({ ...row, status: "new" });
  if (error) throw new Error(error.message);
}

/**
 * How many enquiries match, counted from the store itself rather than from
 * memory, so the spam limits hold across serverless instances and restarts.
 * `email` is compared lowercased; the enquiry route saves it that way.
 */
export async function countEnquiries(filter: {
  since: Date;
  email?: string;
  slotId?: string;
}): Promise<number> {
  const since = filter.since.toISOString();
  const sb = db();
  if (!sb) {
    return mem.enquiries.filter(
      (r) =>
        String(r.created_at) >= since &&
        (filter.email === undefined || String(r.email).toLowerCase() === filter.email) &&
        (filter.slotId === undefined || r.slot_id === filter.slotId),
    ).length;
  }
  let q = sb.from("enquiries").select("id", { count: "exact", head: true }).gte("created_at", since);
  if (filter.email !== undefined) q = q.eq("email", filter.email);
  if (filter.slotId !== undefined) q = q.eq("slot_id", filter.slotId);
  const { count, error } = await q;
  if (error) throw new Error(error.message);
  return count ?? 0;
}

export async function listEnquiries() {
  const sb = db();
  if (!sb) return mem.enquiries;
  const { data } = await sb
    .from("enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  return data ?? [];
}
