"use client";

type Row = Record<string, string | null>;

const COLUMNS = ["created_at", "slot_id", "company", "contact", "email", "phone", "website", "message"];

/** Escapes per RFC 4180, and blocks the leading-=/+/-/@ formula-injection trick. */
function cell(value: unknown): string {
  const s = value == null ? "" : String(value);
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function ExportCsv({ rows }: { rows: Row[] }) {
  function download() {
    const csv = [
      COLUMNS.join(","),
      ...rows.map((r) => COLUMNS.map((c) => cell(r[c])).join(",")),
    ].join("\r\n");

    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `enquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={download}
      disabled={rows.length === 0}
      className="rounded-lg border border-[var(--line)] px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-dim)] transition hover:border-[var(--line-strong)] hover:text-[var(--ink)] disabled:opacity-40"
    >
      Export CSV
    </button>
  );
}
