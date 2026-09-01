"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FunCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
  delay: number;
};

const GRADIENTS: Record<string, string> = {
  purple: "from-violet-500 to-purple-500",
  pink: "from-fuchsia-500 to-pink-500",
  cyan: "from-cyan-500 to-blue-500",
  yellow: "from-yellow-500 to-orange-500",
  emerald: "from-emerald-500 to-teal-500",
};

export function FunCard({ icon: Icon, title, description, gradient, delay }: FunCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.05, y: -4 }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-white/20",
        "bg-white/10 backdrop-blur-sm shadow-lg",
        "transition-all duration-300 hover:border-white/30 hover:shadow-xl",
        "cursor-default",
      )}
    >
      <div className="p-4">
        <div
          className={cn(
            "mb-3 flex h-12 w-12 items-center justify-center rounded-2xl",
            "bg-gradient-to-br shadow-lg",
            GRADIENTS[gradient] ?? GRADIENTS.purple,
          )}
        >
          <Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
        </div>

        <h3 className="mb-1 text-base font-semibold text-ink">{title}</h3>
        <p className="text-sm leading-relaxed text-ink/60">{description}</p>
      </div>

      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300",
          "bg-gradient-to-br from-white/5 to-transparent group-hover:opacity-100",
        )}
      />
    </motion.div>
  );
}
