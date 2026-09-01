"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SkillCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  delay: number;
};

const GRADIENTS: Record<string, string> = {
  purple: "from-purple-500 to-pink-500",
  blue: "from-blue-500 to-cyan-500",
  orange: "from-orange-500 to-amber-500",
  green: "from-green-500 to-emerald-500",
  pink: "from-pink-500 to-rose-500",
};

export function SkillCard({ icon: Icon, title, description, gradient, delay }: SkillCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.03, y: -4 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/20 p-4",
        "bg-white/10 backdrop-blur-sm shadow-lg",
        "transition-all duration-300 hover:border-white/30 hover:shadow-xl",
        "cursor-default",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300",
          "bg-gradient-to-br from-white/10 to-transparent group-hover:opacity-100",
        )}
      />

      <div
        className={cn(
          "mb-3 flex h-10 w-10 items-center justify-center rounded-xl",
          "bg-gradient-to-br shadow-lg",
          GRADIENTS[gradient] ?? GRADIENTS.purple,
        )}
      >
        <Icon className="h-5 w-5 text-white" strokeWidth={1.75} />
      </div>

      <h3 className="mb-1 text-sm font-semibold text-ink">{title}</h3>
      <p className="text-xs leading-relaxed text-ink/60">{description}</p>
    </motion.div>
  );
}
