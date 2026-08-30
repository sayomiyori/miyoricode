"use client";

import { useLocaleSwitch } from "@/components/layout/LocaleSwitchProvider";
import type { Locale } from "@/i18n/routing";
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
        "bg-white/10",
        "border border-white/20 shadow-lg",
      )}
    >
      {OPTIONS.map((option) => {
        const active = option === displayLocale;
        return (
          <button
            key={option}
            type="button"
            onClick={() => switchLocale(option)}
            aria-pressed={active}
            disabled={switching}
            className={cn(
              "rounded-xl px-3 py-1.5 text-xs font-semibold uppercase wdth-wide",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
              "disabled:cursor-wait",
              active
                ? "bg-white/40 text-ink"
                : "text-ink/55 hover:bg-white/20 hover:text-ink",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
