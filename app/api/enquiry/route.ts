import { NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { athlete } from "@/content/site";
import { inr } from "@/lib/format";
import { countEnquiries, saveEnquiry } from "@/lib/db";
import { readSlots } from "@/lib/slotStore";

export const dynamic = "force-dynamic";

/**
 * Spam limits. Every enquiry can send two emails, one of them to an address
 * the visitor typed in, so this route is the one place on the site that can
 * be turned into a spam cannon. The layers, cheapest first:
 *
 *   1. Bot traps — a hidden field and a minimum fill time. Tripping either is
 *      answered with a fake success so the bot learns nothing.
 *   2. Per-IP limits, in memory. Best effort only: each serverless instance
 *      keeps its own count, and an attacker can change IP.
 *   3. Per-address and site-wide limits, counted from the saved enquiries,
 *      so they hold across instances and restarts.
 *   4. The confirmation email carries no text the visitor wrote and goes to
 *      an address at most once a day, so it cannot carry anyone's spam.
 */
const LIMITS = {
  /** Faster than this from opening the form to sending it is a script. */
  minFillMs: 3_000,
  /** A form open longer than this is a replayed request, not a visitor. */
  maxFillMs: 24 * 60 * 60_000,
  ipPer10Min: 3,
  ipPerDay: 8,
  /** Enquiries one email address may send in a day, across all slots. */
  addressPerDay: 2,
  /** Across everyone: past this, enquiries are refused until it calms down. */
  sitePerHour: 20,
  sitePerDay: 60,
};

const HOUR = 60 * 60_000;
const DAY = 24 * HOUR;

/** Anything that looks like a link, in a field that should never hold one. */
const LINK = /https?:\/\/|www\.|\[url|<a\s/i;

const Enquiry = z.object({
  slotId: z.string().min(1),
  company: z.string().trim().min(1).max(120),
  contact: z.string().trim().min(1).max(80),
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
  /** When the form was opened, in ms since the epoch. Missing means a script. */
  openedAt: z.coerce.number().optional(),
});

/* ---------------- per-IP limits ---------------- */

const hits = new Map<string, number[]>();

/** Records a hit and reports whether the IP is over either window. */
function ipLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < DAY);
  recent.push(now);
  hits.set(ip, recent);

  // keep the map bounded: drop every IP with nothing left in the window
  if (hits.size > 5_000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= DAY)) hits.delete(key);
    }
  }

  const last10 = recent.filter((t) => now - t < 10 * 60_000).length;
  return last10 > LIMITS.ipPer10Min || recent.length > LIMITS.ipPerDay;
}

/** The caller's IP. Vercel sets these itself; elsewhere they can be forged. */
function clientIp(req: Request): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local"
  );
}

/* ---------------- route ---------------- */

/** A fake success for a bot or a duplicate, logged so abuse can be spotted. */
function dropped(reason: string) {
  console.info(`[enquiry] dropped: ${reason}`);
  return NextResponse.json({ ok: true });
}
const refuse = (status: number, error: string) => NextResponse.json({ error }, { status });

export async function POST(req: Request) {
  if (ipLimited(clientIp(req))) {
    return refuse(429, "Too many enquiries from here. Try again later.");
  }

  const parsed = Enquiry.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return refuse(400, "Please check the form and try again.");
  const d = parsed.data;
  const email = d.email.toLowerCase();

  // 1. bot traps: answered with a fake success, so nothing is learned
  if (d.company_url) return dropped("honeypot filled");
  const filled = d.openedAt === undefined ? -1 : Date.now() - d.openedAt;
  if (filled < LIMITS.minFillMs || filled > LIMITS.maxFillMs) {
    return dropped(d.openedAt === undefined ? "no fill time" : `filled in ${filled} ms`);
  }

  if (LINK.test(d.contact) || LINK.test(d.company)) {
    return refuse(400, "Please leave links out of your name and company — there is a field for your website.");
  }

  const slot = (await readSlots()).find((s) => s.id === d.slotId);
  if (!slot) return refuse(400, "Unknown slot.");
  if (slot.status !== "open") return refuse(409, "That slot has already gone.");

  // 3. durable limits, counted from what has actually been saved
  const dayAgo = new Date(Date.now() - DAY);
  const [sameSlot, fromAddress, siteHour, siteDay] = await Promise.all([
    countEnquiries({ since: dayAgo, email, slotId: slot.id }),
    countEnquiries({ since: dayAgo, email }),
    countEnquiries({ since: new Date(Date.now() - HOUR) }),
    countEnquiries({ since: dayAgo }),
  ]);

  // the same address resending the same slot: it is already saved and mailed,
  // so answer as if sent and mail nothing new
  if (sameSlot > 0) return dropped("duplicate of an enquiry in the last day");
  if (fromAddress >= LIMITS.addressPerDay) {
    return refuse(429, "You have already sent an enquiry today — I will be in touch.");
  }
  if (siteHour >= LIMITS.sitePerHour || siteDay >= LIMITS.sitePerDay) {
    console.warn(`[enquiry] site-wide limit reached (${siteHour}/h, ${siteDay}/day)`);
    return refuse(429, "A lot of enquiries are coming in right now. Please try again in an hour.");
  }

  await saveEnquiry({
    slot_id: d.slotId,
    company: d.company,
    contact: d.contact,
    email,
    phone: d.phone || null,
    website: d.website || null,
    message: d.message || null,
  });
  console.info(`[enquiry] saved for ${slot.id}`);

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.ENQUIRY_FROM;
  if (apiKey && from) {
    const resend = new Resend(apiKey);
    const lines = [
      `Slot:     ${slot.label} (${slot.tier}, ${inr(slot.price)})`,
      `Company:  ${d.company}`,
      `Contact:  ${d.contact}`,
      `Email:    ${email}`,
      d.phone ? `Phone:    ${d.phone}` : null,
      d.website ? `Website:  ${d.website}` : null,
      d.message ? `\n${d.message}` : null,
    ].filter(Boolean).join("\n");

    const sends = [
      resend.emails.send({
        from,
        to: athlete.email,
        replyTo: email,
        subject: `Sponsor enquiry — ${slot.label} — ${d.company}`,
        text: lines,
      }),
    ];

    // 4. The confirmation goes to whatever address was typed in, so it must
    // not be a way to mail strangers: nothing the visitor wrote appears in it
    // (only our own slot name and price), and an address gets one a day.
    const firstToday = fromAddress === 0;
    if (!firstToday) console.info("[enquiry] confirmation skipped: address already had one today");
    if (firstToday) {
      sends.push(
        resend.emails.send({
          from,
          to: email,
          subject: `Your enquiry for the ${slot.label} slot`,
          text:
            `Thanks for your enquiry.\n\n` +
            `You asked about the ${slot.label} slot (${inr(slot.price)}). ` +
            `${athlete.name} will reply personally, usually within a day.\n\n` +
            `Nothing is committed and nothing is charged until you have an invoice in hand.\n\n` +
            `If you did not send this, you can ignore this email.`,
        }),
      );
    }

    const sent = await Promise.allSettled(sends);

    // The enquiry is already saved, so a failed email must not fail the
    // request — but it must not vanish either. Resend reports most failures
    // as { error } rather than throwing; until a sending domain is verified it
    // refuses anything not addressed to the account's own email.
    sent.forEach((r, i) => {
      const who = i === 0 ? "athlete notification" : "sponsor confirmation";
      const error = r.status === "rejected" ? r.reason : r.value.error;
      if (error) console.error(`[enquiry] ${who} email failed:`, error);
      else if (r.status === "fulfilled") console.info(`[enquiry] ${who} email accepted, id ${r.value.data?.id}`);
    });
  }

  return NextResponse.json({ ok: true });
}
