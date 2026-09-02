"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Database,
  Globe,
  Terminal,
  Zap,
  Brain,
  Film,
  Sparkles,
  Radio,
  Video,
  Gamepad2,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import { SkillCard } from "./SkillCard";
import { FunCard } from "./FunCard";
import { useLocaleSwitch } from "@/components/layout/LocaleSwitchProvider";

type SkillDef = {
  Icon: LucideIcon;
  titleKey: keyof Messages["skills"];
  descKey: keyof Messages["skills"];
  gradient: string;
  delay: number;
};

type FunDef = {
  Icon: LucideIcon;
  titleKey: keyof Messages["fun"];
  descKey: keyof Messages["fun"];
  gradient: string;
  delay: number;
};

type Messages = ReturnType<typeof useLocaleSwitch>["messages"];

const SKILLS: SkillDef[] = [
  { Icon: Code2, titleKey: "Backend", descKey: "backendDesc", gradient: "blue", delay: 0 },
  { Icon: Brain, titleKey: "LLM", descKey: "llmDesc", gradient: "purple", delay: 0.1 },
  { Icon: Database, titleKey: "Databases", descKey: "databasesDesc", gradient: "green", delay: 0.2 },
  { Icon: Globe, titleKey: "API", descKey: "apiDesc", gradient: "orange", delay: 0.3 },
  { Icon: Terminal, titleKey: "DevOps", descKey: "devopsDesc", gradient: "blue", delay: 0.4 },
  { Icon: Zap, titleKey: "Performance", descKey: "performanceDesc", gradient: "orange", delay: 0.5 },
];

const FUN: FunDef[] = [
  { Icon: Film, titleKey: "VideoEditing", descKey: "videoEditingDesc", gradient: "purple", delay: 0 },
  { Icon: Sparkles, titleKey: "VFX", descKey: "vfxDesc", gradient: "pink", delay: 0.1 },
  { Icon: Radio, titleKey: "Streaming", descKey: "streamingDesc", gradient: "purple", delay: 0.2 },
  { Icon: Video, titleKey: "Content", descKey: "contentDesc", gradient: "pink", delay: 0.3 },
  { Icon: Gamepad2, titleKey: "Gaming", descKey: "gamingDesc", gradient: "yellow", delay: 0.4 },
  { Icon: Cpu, titleKey: "Hardware", descKey: "hardwareDesc", gradient: "emerald", delay: 0.5 },
];

type Props = {
  topic: string;
};

export function TopicVisualContent({ topic }: Props) {
  const { messages } = useLocaleSwitch();
  const skills = messages.skills as Record<string, string>;
  const fun = messages.fun as Record<string, string>;

  if (topic === "skills") {
    return (
      <motion.div
        className="mt-4 grid w-full grid-cols-2 gap-3 sm:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
      >
        {SKILLS.map((skill) => (
          <SkillCard
            key={skill.titleKey}
            icon={skill.Icon}
            title={skills[skill.titleKey] ?? skill.titleKey}
            description={skills[skill.descKey] ?? ""}
            gradient={skill.gradient}
            delay={skill.delay}
          />
        ))}
      </motion.div>
    );
  }

  if (topic === "fun") {
    return (
      <motion.div
        className="mt-4 grid w-full grid-cols-2 gap-3 sm:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
      >
        {FUN.map((activity) => (
          <FunCard
            key={activity.titleKey}
            icon={activity.Icon}
            title={fun[activity.titleKey] ?? activity.titleKey}
            description={fun[activity.descKey] ?? ""}
            gradient={activity.gradient}
            delay={activity.delay}
          />
        ))}
      </motion.div>
    );
  }

  return null;
}
