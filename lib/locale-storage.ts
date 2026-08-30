import { LANG_STORAGE_KEY } from "./pointer";
import type { Locale } from "@/i18n/routing";
import { routing } from "@/i18n/routing";

// Kept for callers that still want a client cache. Language at request time
// is resolved from the portfolio-lang cookie (middleware / SSR), not here.

export function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(LANG_STORAGE_KEY);
  if (value && routing.locales.includes(value as Locale)) {
    return value as Locale;
  }
  return null;
}

export function writeStoredLocale(locale: Locale): void {
  window.localStorage.setItem(LANG_STORAGE_KEY, locale);
}
