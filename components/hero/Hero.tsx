"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { AvatarTilt } from "./AvatarTilt";
import { ChatProvider } from "@/components/chat/chat-context";
import { ChatPanel } from "@/components/chat/ChatPanel";
import FluidCursor from "./FluidCursor";
import { HeroCopy } from "./HeroCopy";
import { Logo } from "./Logo";
import { ShortcutRow } from "./ShortcutRow";
import { Watermark } from "./Watermark";
import { LangToggle } from "@/components/layout/LangToggle";
import { LocaleSwitchProvider } from "@/components/layout/LocaleSwitchProvider";
import {
  heroContainer,
  heroItem,
  markHeroEntrancePlayed,
  shouldPlayHeroEntrance,
} from "@/lib/motion-variants";

export function Hero() {
  const playEntrance = useRef(shouldPlayHeroEntrance());

  return (
    <LocaleSwitchProvider>
      <Watermark />
      <FluidCursor />
      <LangToggle />
      <main className="relative z-10 flex min-h-dvh items-center justify-center overflow-x-hidden px-5 py-16">
        <motion.div
          className="flex w-full min-w-0 max-w-[600px] flex-col items-center text-center"
          variants={heroContainer}
          initial={playEntrance.current ? "hidden" : false}
          animate="visible"
          onAnimationComplete={markHeroEntrancePlayed}
        >
          <Logo enter={playEntrance.current} />
          <HeroCopy />
          <motion.div variants={heroItem} className="mt-8 w-full">
            <AvatarTilt />
          </motion.div>
          <ChatProvider>
            <div className="mt-8 w-full">
              <ChatPanel />
            </div>
            <ShortcutRow />
          </ChatProvider>
        </motion.div>
      </main>
    </LocaleSwitchProvider>
  );
}
