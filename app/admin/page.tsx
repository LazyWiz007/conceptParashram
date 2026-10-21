import { listEnquiries } from "@/lib/db";
import { hasDb } from "@/lib/db";
import { isAdmin } from "@/lib/adminAuth";
import { readSlots } from "@/lib/slotStore";
import { inr } from "@/lib/format";
import { AdminLogin } from "./AdminLogin";
import { ExportCsv } from "@/components/panels/ExportCsv";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ bad?: string }>;
}) {
  const { bad } = await searchParams;

  if (!(await isAdmin())) {
    return <AdminLogin bad={bad} next="/admin" />;
  }

  const [rows, slots] = (await Promise.all([listEnquiries(), readSlots()])) as [
    Record<string, string>[],
    Awaited<ReturnType<typeof readSlots>>,
  ];
  const byId = new Map(slots.map((s) => [s.id, s]));

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
      <header className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-4">
          <h1 className="text-2xl font-semibold">Enquiries</h1>
          <a href="/admin/slots" className="text-sm text-[var(--accent)] underline-offset-4 hover:underline">
            Edit slots →
          </a>
        </div>
        <div className="flex items-center gap-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
            {rows.length} total{hasDb ? "" : " · in-memory, set SUPABASE_URL to persist"}
          </p>
          <ExportCsv rows={rows} />
        </div>
      </header>

      {rows.length === 0 ? (
        <p className="text-sm text-[var(--ink-dim)]">Nothing yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
          <table className="w-full text-left text-sm">
            <thead className="bg-[rgb(16_16_18/0.6)] font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--ink-faint)]">
              <tr>
                {["When", "Slot", "Company", "Contact", "Email", "Phone", "Message"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-3 py-2.5 font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(255_255_255/0.08)]">
              {rows.map((r, i) => {
                const slot = byId.get(r.slot_id);
                return (
                  <tr key={r.id ?? i} className="align-top">
                    <td className="whitespace-nowrap px-3 py-2.5 font-mono text-[11px] text-[var(--ink-faint)]">
                      {new Date(r.created_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {slot?.label ?? r.slot_id}
                      <span className="ml-2 font-mono text-[11px] text-[var(--ink-faint)]">
                        {slot ? inr(slot.price) : ""}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">{r.company}</td>
                    <td className="px-3 py-2.5">{r.contact}</td>
                    <td className="px-3 py-2.5">
                      <a href={`mailto:${r.email}`} className="underline-offset-4 hover:underline">
                        {r.email}
                      </a>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-[var(--ink-dim)]">
                      {r.phone ?? "—"}
                    </td>
                    <td className="max-w-[24rem] px-3 py-2.5 text-[var(--ink-dim)]">
                      {r.message ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
