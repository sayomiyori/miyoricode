"use client";

import { motion } from "framer-motion";
import BlurOutUp from "@/components/animata/text/blur-out-up";
import { LocaleFade } from "@/components/layout/LocaleFade";
import { useLocaleSwitch } from "@/components/layout/LocaleSwitchProvider";
import { heroItem } from "@/lib/motion-variants";
import { cn } from "@/lib/utils";

export function HeroCopy() {
  const { messages } = useLocaleSwitch();

  return (
    <>
      <motion.p
        variants={heroItem}
        className="font-display wdth-normal text-xl font-medium text-ink/80 sm:text-2xl"
      >
        <LocaleFade>
          <BlurOutUp text={messages.greeting} />
        </LocaleFade>{" "}
        <span aria-hidden="true" className="inline-block origin-[70%_70%]">
          👋
        </span>
      </motion.p>
      <motion.h1
        variants={heroItem}
        className={cn(
          "mt-2 font-display wdth-condensed text-4xl font-bold leading-[1.05] sm:text-5xl",
          "bg-gradient-to-r from-ink via-splat-blue to-splat-pink bg-clip-text text-transparent",
        )}
      >
        <LocaleFade>
          <BlurOutUp text={messages.role} />
        </LocaleFade>
      </motion.h1>
    </>
  );
}
