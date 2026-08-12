/**
 * Re-export cn() from the canonical shadcn path (lib/utils.ts).
 * shadcn components import from "@/lib/utils" which resolves to lib/utils.ts.
 * Application code should import from "@/lib/utils/index" for the full util set.
 */
export { cn } from "../utils";

/**
 * Format a date to a locale string.
 */
export function formatDate(date: Date | string, locale = "vi-VN"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(date));
}

/**
 * Format a number as currency (VND by default).
 */
export function formatCurrency(amount: number, currency = "VND", locale = "vi-VN"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Truncate a string to a maximum length.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}
