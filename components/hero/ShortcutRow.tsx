"use client";

import { Briefcase, Layers, Smile, Sparkles, User } from "lucide-react";
import { GlassButton } from "./GlassButton";

const SHORTCUTS = [
  { label: "Me", icon: Smile },
  { label: "Projects", icon: Briefcase },
  { label: "Skills", icon: Layers },
  { label: "Fun", icon: Sparkles },
  { label: "Contact", icon: User },
] as const;

export function ShortcutRow() {
  return (
    <nav
      aria-label="Shortcuts"
      className="mt-5 flex w-full flex-wrap items-center justify-center gap-2"
    >
      {SHORTCUTS.map((item) => (
        <GlassButton key={item.label} icon={item.icon} label={item.label} />
      ))}
    </nav>
  );
}
