"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import {
  heroItem,
  interactiveHover,
  interactiveTap,
} from "@/lib/motion-variants";
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
        "glass inline-flex cursor-pointer items-center gap-2 px-3.5 py-2.5 text-sm font-medium wdth-normal text-ink",
        "bg-white/10",
        "border border-white/20 shadow-lg",
        "transition-colors duration-200 hover:bg-white/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" strokeWidth={1.75} />
      <span>{label}</span>
    </Link>
  );
}
