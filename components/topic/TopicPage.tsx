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
import { LocaleSwitchProvider, useLocaleSwitch } from "@/components/layout/LocaleSwitchProvider";
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

function TopicHeader({ topic }: { topic: string }) {
  const { displayLocale } = useLocaleSwitch();
  const header = TOPIC_HEADERS[topic];
  const title = header ? header[displayLocale] ?? header.en : topic;
  return (
    <h1 className="text-2xl font-semibold text-ink wdth-normal">
      {title}
    </h1>
  );
}

type Props = {
  topic: string;
};

export function TopicPage({ topic }: Props) {
  const playEntrance = useRef(shouldPlayHeroEntrance());
  const isProjects = topic === "projects";
  // For skills/fun, badges live inside the chat bubble (via TopicChatPanel).
  // Only show AvatarTilt for the "me" page.
  const showAvatar = topic === "me";

  return (
    <LocaleSwitchProvider>
      <TopicChatProvider topic={topic}>
        <Watermark />
        <LangToggle />
        <main className="relative z-10 flex min-h-dvh items-center justify-center overflow-x-hidden px-5 py-16">
          <motion.div
            className={cn(
              "flex w-full min-w-0 flex-col items-center text-center",
              isProjects ? "max-w-[56rem]" : "max-w-[600px]",
            )}
            variants={heroContainer}
            initial={playEntrance.current ? "hidden" : false}
            animate="visible"
            onAnimationComplete={markHeroEntrancePlayed}
          >
            <Logo enter={playEntrance.current} />

            <motion.div variants={heroItem} className="mt-6">
              <TopicHeader topic={topic} />
            </motion.div>

            {showAvatar && (
              <motion.div variants={heroItem} className="mt-6 w-full">
                <AvatarTilt />
              </motion.div>
            )}

            <motion.div variants={heroItem} className="mt-6 w-full">
              <TopicChatPanel />
            </motion.div>

            <motion.div variants={heroItem} className="mt-4">
              <Link
                href="/"
                className={cn(
                  "group relative inline-flex cursor-pointer items-center gap-1.5 px-3.5 py-2 text-sm font-medium wdth-normal text-ink",
                  "bg-white/10 border border-white/20 shadow-lg",
                  "rounded-xl overflow-hidden",
                  "transition-all duration-300 hover:border-white/30 hover:bg-white/20 hover:shadow-xl hover:scale-105",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
                )}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-splat-blue/10 to-splat-pink/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <ArrowLeft
                  className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
                  aria-hidden="true"
                  strokeWidth={1.75}
                />
                <span className="relative z-10">Back</span>
              </Link>
            </motion.div>
          </motion.div>
        </main>
      </TopicChatProvider>
    </LocaleSwitchProvider>
  );
}
