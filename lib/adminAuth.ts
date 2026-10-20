import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "smt_admin";

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function issueToken(secret: string): string {
  const issued = String(Date.now());
  return `${issued}.${sign(issued, secret)}`;
}

function valid(token: string | undefined, secret: string): boolean {
  if (!token) return false;
  const [issued, mac] = token.split(".");
  if (!issued || !mac) return false;
  // 7 days
  if (Date.now() - Number(issued) > 7 * 864e5) return false;
  const expected = sign(issued, secret);
  const a = Buffer.from(mac, "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) return false;
  return valid((await cookies()).get(COOKIE)?.value, secret);
}

export const ADMIN_COOKIE = COOKIE;
