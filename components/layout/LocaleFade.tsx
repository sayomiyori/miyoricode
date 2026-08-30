"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocaleSwitch } from "@/components/layout/LocaleSwitchProvider";
import { LOCALE_FADE_DURATION } from "@/lib/motion-variants";
import { cn } from "@/lib/utils";

type LocaleFadeProps = {
  children: ReactNode;
  className?: string;
};

export function LocaleFade({ children, className }: LocaleFadeProps) {
  const { displayLocale } = useLocaleSwitch();
  const skipEnter = useRef(true);
  const shouldReduce = useReducedMotion();

  useEffect(() => {
    skipEnter.current = false;
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={displayLocale}
        className={cn("inline-block", className)}
        initial={
          shouldReduce || skipEnter.current ? false : { opacity: 0 }
        }
        animate={{ opacity: 1 }}
        exit={shouldReduce ? undefined : { opacity: 0 }}
        transition={{ duration: LOCALE_FADE_DURATION }}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );
}
