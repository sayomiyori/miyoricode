"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GlassButtonProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}

export function GlassButton({ icon: Icon, label, onClick }: GlassButtonProps) {
  return (
    <button
      type="button"
      onClick={
        onClick ??
        (() => {
          // TODO: backend
        })
      }
      className={cn(
        "glass inline-flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium wdth-normal text-ink",
        "bg-white/10 backdrop-blur-md backdrop-saturate-150",
        "border border-white/20 shadow-lg",
        "hover:bg-white/20 transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" strokeWidth={1.75} />
      <span>{label}</span>
    </button>
  );
}
