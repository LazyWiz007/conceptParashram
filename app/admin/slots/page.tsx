import { isAdmin } from "@/lib/adminAuth";
import { readSlots, slotsArePersistent } from "@/lib/slotStore";
import { AdminLogin } from "../AdminLogin";
import { AdminSlots } from "./AdminSlots";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function SlotsAdmin({
  searchParams,
}: {
  searchParams: Promise<{ bad?: string }>;
}) {
  const { bad } = await searchParams;
  if (!(await isAdmin())) {
    return <AdminLogin bad={bad} next="/admin/slots" />;
  }
  return <AdminSlots initial={await readSlots()} persistent={slotsArePersistent} />;
}
