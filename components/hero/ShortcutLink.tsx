"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type ShortcutLinkProps = {
  icon: LucideIcon;
  label: string;
  href: string;
};

export function ShortcutLink({ icon: Icon, label, href }: ShortcutLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative inline-flex cursor-pointer items-center gap-2 px-3.5 py-2.5 text-sm font-medium wdth-normal text-ink",
        "bg-white/10 border border-white/20 shadow-lg",
        "rounded-xl overflow-hidden",
        "transition-all duration-300 ease-out",
        "hover:bg-white/20 hover:border-white/30 hover:shadow-xl hover:scale-105",
        "active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
      )}
    >
      <span className="absolute inset-0 bg-gradient-to-r from-splat-blue/10 via-splat-pink/10 to-splat-blue/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <Icon
        className="relative z-10 h-4 w-4 shrink-0 transition-transform duration-300 group-hover:scale-110"
        aria-hidden="true"
        strokeWidth={1.75}
      />
      <span className="relative z-10">{label}</span>
    </Link>
  );
}
