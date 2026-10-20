import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { SLOTS_BY_ID } from "@/content/slots";
import { athlete } from "@/content/site";
import { inr } from "@/lib/format";
import { saveEnquiry } from "@/lib/db";

export const dynamic = "force-dynamic";

const Enquiry = z.object({
  slotId: z.string().min(1),
  company: z.string().trim().min(1).max(120),
  contact: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  website: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
  /**
   * Honeypot. Deliberately permissive: a strict schema would reject the bot
   * with a 400 and tell it which field it tripped on. Accept anything here and
   * drop it silently below instead.
   */
  company_url: z.string().optional(),
});

const hits = new Map<string, number[]>();
function rateLimited(key: string, max = 5, windowMs = 10 * 60_000): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  return recent.length > max;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many enquiries. Try again shortly." }, { status: 429 });
  }

  const parsed = Enquiry.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 });
  }
  const d = parsed.data;
  if (d.company_url) return NextResponse.json({ ok: true }); // silently drop bots

  const slot = SLOTS_BY_ID.get(d.slotId);
  if (!slot) return NextResponse.json({ error: "Unknown slot." }, { status: 400 });
  if (slot.status !== "open") {
    return NextResponse.json({ error: "That slot has already gone." }, { status: 409 });
  }

  await saveEnquiry({
    slot_id: d.slotId,
    company: d.company,
    contact: d.contact,
    email: d.email,
    phone: d.phone || null,
    website: d.website || null,
    message: d.message || null,
  });

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ENQUIRY_FROM;
  if (apiKey && from) {
    const resend = new Resend(apiKey);
    const lines = [
      `Slot:     ${slot.label} (${slot.tier}, ${inr(slot.price)})`,
      `Company:  ${d.company}`,
      `Contact:  ${d.contact}`,
      `Email:    ${d.email}`,
      d.phone ? `Phone:    ${d.phone}` : null,
      d.website ? `Website:  ${d.website}` : null,
      d.message ? `\n${d.message}` : null,
    ].filter(Boolean).join("\n");

    await Promise.allSettled([
      resend.emails.send({
        from,
        to: athlete.email,
        replyTo: d.email,
        subject: `Sponsor enquiry — ${slot.label} — ${d.company}`,
        text: lines,
      }),
      resend.emails.send({
        from,
        to: d.email,
        subject: `Your enquiry for the ${slot.label} slot`,
        text:
          `Thanks ${d.contact}.\n\n` +
          `You asked about the ${slot.label} slot (${inr(slot.price)}). ` +
          `${athlete.name} will reply personally, usually within a day.\n\n` +
          `Nothing is committed and nothing is charged until you have an invoice in hand.`,
      }),
    ]);
  }

  return NextResponse.json({ ok: true });
}
