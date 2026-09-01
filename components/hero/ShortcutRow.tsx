"use client";

import { Briefcase, Layers, Smile, Sparkles, User } from "lucide-react";
import { type ShortcutKey } from "@/lib/shortcut-prompts";
import { ShortcutLink } from "./ShortcutLink";

const SHORTCUTS: { key: ShortcutKey; label: string; icon: typeof Smile }[] = [
  { key: "me", label: "Me", icon: Smile },
  { key: "projects", label: "Projects", icon: Briefcase },
  { key: "skills", label: "Skills", icon: Layers },
  { key: "fun", label: "Fun", icon: Sparkles },
  { key: "contact", label: "Contact", icon: User },
];

export function ShortcutRow() {
  return (
    <nav
      aria-label="Shortcuts"
      className="mt-5 flex w-full flex-wrap items-center justify-center gap-2"
    >
      {SHORTCUTS.map((item) => (
        <ShortcutLink
          key={item.key}
          icon={item.icon}
          label={item.label}
          href={`/topic/${item.key}`}
        />
      ))}
    </nav>
  );
}
