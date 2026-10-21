/**
 * Draft content must never reach a sponsor's screen. Anything still holding a
 * TODO, an empty string or an obvious dummy value is treated as absent so the
 * surrounding block can hide itself, rather than rendering "TODO —" at someone
 * evaluating a sponsorship.
 */
const DUMMY = [/^todo\b/i, /^tbd\b/i, /^0+$/, /^\+?91[\s0]+$/];

export function isPlaceholder(value: string | number | null | undefined): boolean {
  if (value == null) return true;
  if (typeof value === "number") return value === 0;
  const v = value.trim();
  if (!v) return true;
  return DUMMY.some((re) => re.test(v));
}

/** The value, or null when it is still a placeholder. */
export function real<T extends string | number | null | undefined>(value: T): T | null {
  return isPlaceholder(value) ? null : value;
}
