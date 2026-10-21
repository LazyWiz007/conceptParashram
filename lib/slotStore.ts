import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { SLOTS as SEED } from "@/content/slots";
import { db, hasDb } from "./db";
import type { Slot } from "./types";

/**
 * Where the editable slot list lives.
 *
 * Supabase when it is configured, otherwise a JSON file on disk. The file path
 * works locally and on any host with a persistent disk; on serverless it is
 * read-only after a deploy, which is exactly why Supabase is the real answer.
 * Either way the first read seeds from content/slots.ts, so the site is never
 * empty.
 */
const FILE = path.join(process.cwd(), "data", "slots.json");
const KEY = "slots";

export async function readSlots(): Promise<Slot[]> {
  const sb = db();
  if (sb) {
    const { data } = await sb.from("site_state").select("value").eq("key", KEY).maybeSingle();
    const value = data?.value as Slot[] | undefined;
    if (value?.length) return value;
    return SEED;
  }

  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as Slot[];
    if (parsed?.length) return parsed;
  } catch {
    /* not written yet */
  }
  return SEED;
}

export async function writeSlots(slots: Slot[]): Promise<void> {
  const sb = db();
  if (sb) {
    const { error } = await sb
      .from("site_state")
      .upsert({ key: KEY, value: slots, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return;
  }

  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(slots, null, 2), "utf8");
}

export const slotsArePersistent = hasDb;
