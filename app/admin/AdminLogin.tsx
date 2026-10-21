export function AdminLogin({ bad, next }: { bad?: string; next?: string }) {
  return (
    <main className="grid min-h-[100svh] place-items-center px-5">
      <form
        action="/api/admin-login"
        method="post"
        className="w-full max-w-xs space-y-3 rounded-2xl border border-[var(--line)] bg-[rgb(16_16_18/0.6)] p-6"
      >
        <h1 className="text-lg font-semibold">Admin</h1>
        {bad && <p className="text-xs text-[var(--accent)]">Wrong password.</p>}
        <input type="hidden" name="next" value={next ?? "/admin"} />
        <input
          name="password"
          type="password"
          autoFocus
          placeholder="Password"
          className="w-full rounded-lg border border-[var(--line)] bg-[rgb(10_10_11/0.6)] px-3 py-2 text-sm outline-none focus:border-[var(--line-strong)]"
        />
        <button className="w-full rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[#0a0a0b]">
          Open
        </button>
      </form>
    </main>
  );
}
