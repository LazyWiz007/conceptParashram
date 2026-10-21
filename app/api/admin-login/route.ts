import { NextResponse } from "next/server";
import { ADMIN_COOKIE, issueToken } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    return NextResponse.json({ error: "ADMIN_PASSWORD is not set." }, { status: 500 });
  }
  const form = await req.formData();
  // only ever bounce to our own paths, never an absolute URL from the form
  const raw = String(form.get("next") ?? "/admin");
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/admin";

  if (String(form.get("password") ?? "") !== secret) {
    return NextResponse.redirect(new URL(`${next}?bad=1`, req.url), { status: 303 });
  }
  const res = NextResponse.redirect(new URL(next, req.url), { status: 303 });
  res.cookies.set(ADMIN_COOKIE, issueToken(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 86400,
  });
  return res;
}
