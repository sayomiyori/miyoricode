export function hasFinePointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(any-pointer: fine)").matches;
}

export const LANG_STORAGE_KEY = "portfolio-lang";
