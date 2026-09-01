"use client";

import { motion } from "framer-motion";
import { useLocaleSwitch } from "@/components/layout/LocaleSwitchProvider";
import type { Locale } from "@/i18n/routing";
import { interactiveHover, interactiveTap } from "@/lib/motion-variants";
import { cn } from "@/lib/utils";

const OPTIONS: Locale[] = ["en", "ru"];

export function LangToggle() {
  const { displayLocale, messages, switching, switchLocale } = useLocaleSwitch();

  return (
    <div
      role="group"
      aria-label={messages.langAria}
      className={cn(
        "glass fixed right-5 top-5 z-20 flex items-center p-1 sm:right-6 sm:top-6",
        "bg-white/10 border border-white/20 shadow-lg",
        "transition-all duration-300 hover:border-white/30 hover:shadow-xl",
      )}
    >
      {OPTIONS.map((option) => {
        const active = option === displayLocale;
        return (
          <motion.button
            key={option}
            type="button"
            onClick={() => switchLocale(option)}
            aria-pressed={active}
            disabled={switching}
            whileHover={switching ? undefined : interactiveHover}
            whileTap={switching ? undefined : interactiveTap}
            className={cn(
              "relative cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold uppercase wdth-wide",
              "transition-all duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
              "disabled:cursor-wait",
              active
                ? "bg-gradient-to-r from-splat-blue/20 to-splat-pink/20 text-ink shadow-sm"
                : "text-ink/55 hover:bg-white/20 hover:text-ink",
            )}
          >
            {active && (
              <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-splat-blue/10 to-splat-pink/10" />
            )}
            <span className="relative z-10">{option}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
