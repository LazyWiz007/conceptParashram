import { NextResponse } from "next/server";
import { readSlotViews } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const bySlot = await readSlotViews();
  return NextResponse.json(
    { bySlot, asOf: new Date().toISOString() },
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } },
  );
}
