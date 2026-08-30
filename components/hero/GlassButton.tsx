"use client";

import type { LucideIcon } from "lucide-react";
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
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "glass inline-flex cursor-pointer items-center gap-2 px-3.5 py-2.5 text-sm font-medium wdth-normal text-ink",
        "bg-white/10 backdrop-blur-md backdrop-saturate-150",
        "border border-white/20 shadow-lg",
        "transition-colors duration-200 hover:bg-white/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
        "disabled:cursor-not-allowed disabled:opacity-50",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" strokeWidth={1.75} />
      <span>{label}</span>
    </button>
  );
}
