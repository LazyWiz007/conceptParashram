export function Section({
  id,
  eyebrow,
  title,
  lede,
  children,
  className = "",
}: {
  id: string;
  eyebrow: string;
  title: string;
  lede?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`relative border-t border-[var(--line)] px-5 py-24 sm:px-8 sm:py-32 ${className}`}
    >
      <div className="mx-auto w-full max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
          {eyebrow}
        </p>
        <h2 className="mt-3.5 text-balance text-[2.1rem] font-semibold leading-[1.08] tracking-tight sm:text-5xl">
          {title}
        </h2>
        {lede && (
          <p className="mt-5 max-w-[60ch] text-lg leading-relaxed text-[var(--ink-dim)]">{lede}</p>
        )}
        {children && <div className="mt-12">{children}</div>}
      </div>
    </section>
  );
}
