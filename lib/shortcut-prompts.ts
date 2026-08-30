export const SHORTCUT_KEYS = [
  "me",
  "projects",
  "skills",
  "fun",
  "contact",
] as const;

export type ShortcutKey = (typeof SHORTCUT_KEYS)[number];

/** Exact phrases from the API structured-answer triggers. */
export const SHORTCUT_PROMPTS = {
  en: {
    me: "Tell me about yourself",
    projects: "Tell me about your projects",
    skills: "Tell me about your skills",
    fun: "Something fun",
    contact: "How can I reach you",
  },
  ru: {
    me: "Расскажи о себе",
    projects: "Расскажи о проектах",
    skills: "Расскажи о навыках",
    fun: "Для души",
    contact: "Как с тобой связаться",
  },
} as const satisfies Record<"en" | "ru", Record<ShortcutKey, string>>;
