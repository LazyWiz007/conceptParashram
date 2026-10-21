import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/adminAuth";
import { readSlots, writeSlots } from "@/lib/slotStore";
import type { Slot } from "@/lib/types";

export const dynamic = "force-dynamic";

const Vec3 = z.tuple([z.number(), z.number(), z.number()]);

const SlotSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(80),
  tier: z.enum(["title", "prime", "core", "support"]),
  price: z.number().int().min(0).max(100_000_000),
  status: z.enum(["open", "pending", "sold"]),
  pitch: z.string().max(600).default(""),
  size: z.string().max(40).default(""),
  anchor: z.object({
    position: Vec3,
    rotation: Vec3,
    size: Vec3,
    spin: z.number().min(-Math.PI * 2).max(Math.PI * 2).optional(),
  }),
  sponsor: z
    .object({
      name: z.string().max(80),
      logo: z.string().max(400).nullable(),
      url: z.string().max(300).optional(),
      handle: z.string().max(80).optional(),
      tagline: z.string().max(200).optional(),
      color: z.string().max(32).optional(),
    })
    .optional(),
});

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }
  return NextResponse.json({ slots: await readSlots() });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const parsed = z
    .object({ slots: z.array(SlotSchema).max(60) })
    .safeParse(await req.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "invalid slots" },
      { status: 400 },
    );
  }

  const ids = parsed.data.slots.map((s) => s.id);
  if (new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: "duplicate slot id" }, { status: 400 });
  }

  await writeSlots(parsed.data.slots as Slot[]);
  return NextResponse.json({ ok: true, count: ids.length });
}
