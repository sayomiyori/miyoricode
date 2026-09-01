"use client";

import { motion } from "framer-motion";
import {
  Code2,
  Database,
  Globe,
  Terminal,
  Zap,
  Brain,
  Gamepad2,
  Camera,
  Music,
  Plane,
  Coffee,
  BookOpen,
} from "lucide-react";
import { SkillCard } from "./SkillCard";
import { FunCard } from "./FunCard";
import { cn } from "@/lib/utils";

const SKILLS = [
  { icon: Code2, title: "Backend", description: "Python, FastAPI, Node.js", gradient: "blue", delay: 0 },
  { icon: Brain, title: "LLM / AI", description: "RAG, LangChain, GPT", gradient: "purple", delay: 0.1 },
  { icon: Database, title: "Databases", description: "PostgreSQL, Redis, MongoDB", gradient: "green", delay: 0.2 },
  { icon: Globe, title: "API Design", description: "REST, GraphQL, WebSockets", gradient: "orange", delay: 0.3 },
  { icon: Terminal, title: "DevOps", description: "Docker, CI/CD, Linux", gradient: "blue", delay: 0.4 },
  { icon: Zap, title: "Performance", description: "Caching, Optimization", gradient: "orange", delay: 0.5 },
];

const FUN_ACTIVITIES = [
  { icon: Gamepad2, title: "Gaming", description: "Love exploring new indie games and speedrunning classics", gradient: "purple", delay: 0 },
  { icon: Camera, title: "Photography", description: "Capturing urban landscapes and street moments", gradient: "cyan", delay: 0.1 },
  { icon: Music, title: "Music", description: "Electronic, lo-fi beats for deep focus sessions", gradient: "pink", delay: 0.2 },
  { icon: Plane, title: "Travel", description: "Discovering new cultures and cuisines around the world", gradient: "yellow", delay: 0.3 },
  { icon: Coffee, title: "Coffee", description: "Exploring specialty roasts and brewing methods", gradient: "emerald", delay: 0.4 },
  { icon: BookOpen, title: "Reading", description: "Sci-fi, tech blogs, and occasional manga", gradient: "purple", delay: 0.5 },
];

type Props = {
  topic: string;
};

export function TopicVisualContent({ topic }: Props) {
  if (topic === "skills") {
    return (
      <motion.div
        className="mt-6 grid w-full grid-cols-2 gap-3 sm:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
      >
        {SKILLS.map((skill) => (
          <SkillCard key={skill.title} {...skill} />
        ))}
      </motion.div>
    );
  }

  if (topic === "fun") {
    return (
      <motion.div
        className="mt-6 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
      >
        {FUN_ACTIVITIES.map((activity) => (
          <FunCard key={activity.title} {...activity} />
        ))}
      </motion.div>
    );
  }

  return null;
}
