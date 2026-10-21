import { NextResponse } from "next/server";
import { bumpSlotView } from "@/lib/db";
import { readSlots } from "@/lib/slotStore";

export const dynamic = "force-dynamic";

/** Fired when a visitor actually looks at a slot. Debounced on the client. */
export async function POST(req: Request) {
  let slotId: unknown;
  try {
    ({ slotId } = await req.json());
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }
  const slots = await readSlots();
  if (typeof slotId !== "string" || !slots.some((s) => s.id === slotId)) {
    return NextResponse.json({ error: "unknown slot" }, { status: 400 });
  }
  await bumpSlotView(slotId);
  return NextResponse.json({ ok: true });
}
