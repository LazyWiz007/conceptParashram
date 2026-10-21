import { readdir } from "node:fs/promises";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "media", "photos");

/** The headshot for the athlete badge, if one has been dropped in. */
export async function findAvatar(): Promise<string | null> {
  try {
    const files = await readdir(DIR);
    const hit = files.find((f) => /^avatar\.(jpe?g|png|webp|avif)$/i.test(f));
    return hit ? `/media/photos/${hit}` : null;
  } catch {
    return null;
  }
}
