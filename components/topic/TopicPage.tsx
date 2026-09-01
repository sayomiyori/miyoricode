"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { TopicChatProvider } from "@/components/chat/topic-chat-context";
import { TopicChatPanel } from "@/components/chat/TopicChatPanel";
import { AvatarTilt } from "@/components/hero/AvatarTilt";
import { Logo } from "@/components/hero/Logo";
import { Watermark } from "@/components/hero/Watermark";
import { LangToggle } from "@/components/layout/LangToggle";
import { LocaleSwitchProvider } from "@/components/layout/LocaleSwitchProvider";
import {
  heroContainer,
  heroItem,
  markHeroEntrancePlayed,
  shouldPlayHeroEntrance,
} from "@/lib/motion-variants";
import { cn } from "@/lib/utils";

const TOPIC_HEADERS: Record<string, { en: string; ru: string }> = {
  me: { en: "About Me", ru: "Обо мне" },
  projects: { en: "Projects", ru: "Проекты" },
  skills: { en: "Skills", ru: "Навыки" },
  fun: { en: "For Fun", ru: "Для души" },
  contact: { en: "Contact", ru: "Контакты" },
};

type Props = {
  topic: string;
};

export function TopicPage({ topic }: Props) {
  const playEntrance = useRef(shouldPlayHeroEntrance());

  return (
    <LocaleSwitchProvider>
      <TopicChatProvider topic={topic}>
        <Watermark />
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

            <motion.div variants={heroItem} className="mt-6">
              <h1
                className={cn(
                  "text-2xl font-semibold text-ink wdth-normal",
                )}
              >
                {TOPIC_HEADERS[topic]?.en ?? topic}
              </h1>
            </motion.div>

            <motion.div variants={heroItem} className="mt-6 w-full">
              <AvatarTilt />
            </motion.div>

            <motion.div variants={heroItem} className="mt-6 w-full">
              <TopicChatPanel />
            </motion.div>

            <motion.div variants={heroItem} className="mt-4">
              <Link
                href="/"
                className={cn(
                  "glass inline-flex cursor-pointer items-center gap-1.5 px-3.5 py-2 text-sm font-medium wdth-normal text-ink",
                  "bg-white/10 border border-white/20 shadow-lg",
                  "transition-colors duration-200 hover:bg-white/20",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
                )}
              >
                <ArrowLeft
                  className="h-4 w-4"
                  aria-hidden="true"
                  strokeWidth={1.75}
                />
                <span>Back</span>
              </Link>
            </motion.div>
          </motion.div>
        </main>
      </TopicChatProvider>
    </LocaleSwitchProvider>
  );
}
