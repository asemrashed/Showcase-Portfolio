import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "USD") {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString("en-US")}`;
  }
}

export function formatPriceRange(min: number, max: number, currency = "USD") {
  return min === max ? formatPrice(min, currency) : `${formatPrice(min, currency)} – ${formatPrice(max, currency)}`;
}

function humanDays(days: number) {
  if (days >= 60 && days % 30 === 0) return { n: days / 30, unit: "month" };
  if (days >= 14 && days % 7 === 0) return { n: days / 7, unit: "week" };
  return { n: days, unit: "day" };
}

/** Durations are stored in days. 14–28 -> "2–4 weeks", 5–10 -> "5–10 days". */
export function formatDuration(minDays: number, maxDays: number) {
  const a = humanDays(minDays);
  const b = humanDays(maxDays);
  const plural = (n: number, u: string) => (n === 1 ? u : `${u}s`);
  if (minDays === maxDays) return `${a.n} ${plural(a.n, a.unit)}`;
  if (a.unit === b.unit) return `${a.n}–${b.n} ${plural(b.n, b.unit)}`;
  return `${minDays}–${maxDays} days`;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

/** e.g. "3h ago", "yesterday", "Jan 4" — accepts Date, ISO string, or timestamp. */
export function formatRelative(input: Date | string | number) {
  const date = input instanceof Date ? input : new Date(input);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: date.getFullYear() === new Date().getFullYear() ? undefined : "numeric" });
}

/** Split plain text into paragraphs on blank lines. */
export function paragraphs(text: string) {
  return text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
}
