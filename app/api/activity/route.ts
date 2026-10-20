import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { readActivity, recordVisit } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Vercel gives us the country; we never store the IP itself. */
function visitorHash(req: Request): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "local";
  const ua = req.headers.get("user-agent") ?? "";
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.VISITOR_SALT ?? "sponsor-my-tri";
  return createHash("sha256").update(`${ip}|${ua}|${day}|${salt}`).digest("hex").slice(0, 24);
}

export async function GET(req: Request) {
  const country =
    (req.headers.get("x-vercel-ip-country") ?? "").toUpperCase() ||
    (process.env.NODE_ENV === "development" ? "IN" : "");
  if (country) {
    try {
      await recordVisit(visitorHash(req), country);
    } catch {
      /* never let presence tracking break the page */
    }
  }
  const activity = await readActivity();
  return NextResponse.json(activity, { headers: { "Cache-Control": "no-store" } });
}
