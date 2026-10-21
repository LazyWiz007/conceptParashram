import { Studio } from "@/components/Studio";
import { findAvatar } from "@/lib/photos";
import { readSlots } from "@/lib/slotStore";

// slots are editable in /admin, so this page cannot be baked at build time
export const dynamic = "force-dynamic";

/**
 * One frame, no scroll. Everything a visitor needs is reachable from the suit:
 * the slot list, a slot's own card, and the About dialog behind the badge.
 */
export default async function Home() {
  const [avatar, slots] = await Promise.all([findAvatar(), readSlots()]);
  return <Studio slots={slots} avatar={avatar} />;
}
