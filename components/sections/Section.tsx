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
    <section id={id} className={`relative border-t border-[var(--line)] px-5 py-20 sm:px-8 sm:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-5xl">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ink-faint)]">
          {eyebrow}
        </p>
        <h2 className="mt-3 text-balance text-3xl font-semibold leading-[1.1] tracking-tight sm:text-4xl">
          {title}
        </h2>
        {lede && (
          <p className="mt-4 max-w-[62ch] text-base leading-relaxed text-[var(--ink-dim)]">{lede}</p>
        )}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}
