import { NextResponse } from "next/server";
import { SLOTS_BY_ID } from "@/content/slots";
import { bumpSlotView } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Fired when a visitor actually looks at a slot. Debounced on the client. */
export async function POST(req: Request) {
  let slotId: unknown;
  try {
    ({ slotId } = await req.json());
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  if (typeof slotId !== "string" || !SLOTS_BY_ID.has(slotId)) {
    return NextResponse.json({ error: "unknown slot" }, { status: 400 });
  }
  await bumpSlotView(slotId);
  return NextResponse.json({ ok: true });
}
