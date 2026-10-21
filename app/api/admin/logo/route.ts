import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};
const MAX = 2 * 1024 * 1024;

/** Sniff the real bytes — the browser's reported type is not evidence. */
function sniff(buf: Buffer): string | null {
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return "image/png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length > 12 && buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP")
    return "image/webp";
  const head = buf.subarray(0, 400).toString("utf8").trim().toLowerCase();
  if (head.startsWith("<?xml") || head.startsWith("<svg")) return "image/svg+xml";
  return null;
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "unauthorised" }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("logo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no file" }, { status: 400 });
  }
  if (file.size > MAX) {
    return NextResponse.json({ error: "logo must be under 2 MB" }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const mime = sniff(buf);
  if (!mime || !TYPES[mime]) {
    return NextResponse.json({ error: "PNG, JPG, WebP or SVG only" }, { status: 400 });
  }

  const name = `${randomUUID()}.${TYPES[mime]}`;
  const sb = db();

  if (sb) {
    const { error } = await sb.storage.from("logos").upload(name, buf, {
      contentType: mime,
      cacheControl: "31536000",
      upsert: false,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const { data } = sb.storage.from("logos").getPublicUrl(name);
    return NextResponse.json({ url: data.publicUrl });
  }

  // local fallback: writeable in dev and on a host with a disk, not on serverless
  const dir = path.join(process.cwd(), "public", "media", "logos");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return NextResponse.json({ url: `/media/logos/${name}` });
}
