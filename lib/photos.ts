import { readdir } from "node:fs/promises";
import path from "node:path";

const DIR = path.join(process.cwd(), "public", "media", "photos");
const IMAGE = /\.(jpe?g|png|webp|avif)$/i;

/**
 * Lists whatever is in public/media/photos. Read at build time by the server
 * components that use it, so adding a photo is a matter of dropping the file
 * in and rebuilding — no code change, no manifest to keep in sync.
 */
export async function listPhotos(): Promise<string[]> {
  try {
    const files = await readdir(DIR);
    return files
      .filter((f) => IMAGE.test(f) && !f.startsWith(".") && !f.startsWith("avatar"))
      .sort()
      .map((f) => `/media/photos/${f}`);
  } catch {
    return [];
  }
}

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
