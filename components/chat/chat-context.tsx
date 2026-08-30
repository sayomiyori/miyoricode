"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useChat } from "@/components/chat/use-chat";
import { useLocaleSwitch } from "@/components/layout/LocaleSwitchProvider";
import type { ChatTurn } from "@/lib/chat";

type ChatContextValue = {
  turns: ChatTurn[];
  pending: boolean;
  send: (message: string) => Promise<void>;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { displayLocale, messages } = useLocaleSwitch();
  const chat = useChat(displayLocale, messages.chatError);

  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>;
}

export function useChatContext(): ChatContextValue {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within ChatProvider");
  }
  return context;
}
