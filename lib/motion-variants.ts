import type { Variants } from "framer-motion";

export const LOCALE_FADE_DURATION = 0.2;
export const LOCALE_FADE_MS = 200;

export const heroContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export const heroItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export const interactiveHover = { scale: 1.03 };
export const interactiveTap = { scale: 0.97 };

declare global {
  interface Window {
    __sayomiHeroEntered?: boolean;
  }
}

export function shouldPlayHeroEntrance(): boolean {
  if (typeof window === "undefined") return true;
  return window.__sayomiHeroEntered !== true;
}

export function markHeroEntrancePlayed(): void {
  if (typeof window === "undefined") return;
  window.__sayomiHeroEntered = true;
}
