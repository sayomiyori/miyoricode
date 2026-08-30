"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { LOCALE_FADE_MS } from "@/lib/motion-variants";
import en from "@/messages/en.json";
import ru from "@/messages/ru.json";

const HOME = {
  en: en.Home,
  ru: ru.Home,
} as const;

export type HomeMessages = (typeof HOME)[Locale];

type LocaleSwitchContextValue = {
  displayLocale: Locale;
  messages: HomeMessages;
  switching: boolean;
  switchLocale: (next: Locale) => void;
};

const LocaleSwitchContext = createContext<LocaleSwitchContextValue | null>(
  null,
);

export function LocaleSwitchProvider({ children }: { children: ReactNode }) {
  const routeLocale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [displayLocale, setDisplayLocale] = useState<Locale>(routeLocale);
  const [switching, setSwitching] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!switching && routeLocale !== displayLocale) {
      setDisplayLocale(routeLocale);
    }
    if (switching && routeLocale === displayLocale) {
      setSwitching(false);
    }
  }, [routeLocale, displayLocale, switching]);

  useEffect(() => {
    return () => {
      window.clearTimeout(timerRef.current);
    };
  }, []);

  const switchLocale = useCallback(
    (next: Locale) => {
      if (next === displayLocale || switching) return;

      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const duration = reduced ? 0 : LOCALE_FADE_MS;

      setSwitching(true);
      setDisplayLocale(next);

      window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => {
        router.replace(pathname, { locale: next });
      }, duration);
    },
    [displayLocale, pathname, router, switching],
  );

  const value = useMemo<LocaleSwitchContextValue>(
    () => ({
      displayLocale,
      messages: HOME[displayLocale],
      switching,
      switchLocale,
    }),
    [displayLocale, switchLocale, switching],
  );

  return (
    <LocaleSwitchContext.Provider value={value}>
      {children}
    </LocaleSwitchContext.Provider>
  );
}

export function useLocaleSwitch(): LocaleSwitchContextValue {
  const context = useContext(LocaleSwitchContext);
  if (!context) {
    throw new Error("useLocaleSwitch must be used within LocaleSwitchProvider");
  }
  return context;
}
