"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  heroItem,
  interactiveHover,
  interactiveTap,
} from "@/lib/motion-variants";
import { cn } from "@/lib/utils";

interface GlassButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function GlassButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
}: GlassButtonProps) {
  return (
    <motion.button
      type="button"
      variants={heroItem}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : interactiveHover}
      whileTap={disabled ? undefined : interactiveTap}
      className={cn(
        "group relative overflow-hidden",
        "glass inline-flex cursor-pointer items-center gap-2 px-3.5 py-2.5 text-sm font-medium wdth-normal text-ink",
        "bg-white/10 border border-white/20 shadow-lg",
        "transition-all duration-300 ease-out hover:border-white/35 hover:bg-white/20 hover:shadow-xl",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
      )}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-splat-blue/10 to-splat-pink/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <Icon
        className="relative z-10 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110"
        aria-hidden="true"
        strokeWidth={1.75}
      />
      <span className="relative z-10">{label}</span>
    </motion.button>
  );
}
