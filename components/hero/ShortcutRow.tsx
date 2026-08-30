"use client";

import { Briefcase, Layers, Smile, Sparkles, User } from "lucide-react";
import { useChatContext } from "@/components/chat/chat-context";
import { useLocaleSwitch } from "@/components/layout/LocaleSwitchProvider";
import { SHORTCUT_PROMPTS, type ShortcutKey } from "@/lib/shortcut-prompts";
import { GlassButton } from "./GlassButton";

const SHORTCUTS: { key: ShortcutKey; label: string; icon: typeof Smile }[] = [
  { key: "me", label: "Me", icon: Smile },
  { key: "projects", label: "Projects", icon: Briefcase },
  { key: "skills", label: "Skills", icon: Layers },
  { key: "fun", label: "Fun", icon: Sparkles },
  { key: "contact", label: "Contact", icon: User },
];

export function ShortcutRow() {
  const { displayLocale } = useLocaleSwitch();
  const { send, pending } = useChatContext();
  const prompts = SHORTCUT_PROMPTS[displayLocale];

  return (
    <nav
      aria-label="Shortcuts"
      className="mt-5 flex w-full flex-wrap items-center justify-center gap-2"
    >
      {SHORTCUTS.map((item) => (
        <GlassButton
          key={item.key}
          icon={item.icon}
          label={item.label}
          disabled={pending}
          onClick={() => {
            void send(prompts[item.key]);
          }}
        />
      ))}
    </nav>
  );
}
