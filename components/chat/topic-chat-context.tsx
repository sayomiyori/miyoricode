"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useTopicChat } from "@/components/chat/use-topic-chat";
import { useLocaleSwitch } from "@/components/layout/LocaleSwitchProvider";
import type { ChatTurn } from "@/lib/chat";

type TopicChatContextValue = {
  topic: string;
  turns: ChatTurn[];
  pending: boolean;
  send: (message: string) => Promise<void>;
};

const TopicChatContext = createContext<TopicChatContextValue | null>(null);

export function TopicChatProvider({
  children,
  topic,
}: {
  children: ReactNode;
  topic: string;
}) {
  const { displayLocale, messages } = useLocaleSwitch();
  const chat = useTopicChat(topic, displayLocale, messages.chatError);

  return (
    <TopicChatContext.Provider
      value={{ topic, turns: chat.turns, pending: chat.pending, send: chat.send }}
    >
      {children}
    </TopicChatContext.Provider>
  );
}

export function useTopicChatContext(): TopicChatContextValue {
  const context = useContext(TopicChatContext);
  if (!context) {
    throw new Error(
      "useTopicChatContext must be used within TopicChatProvider",
    );
  }
  return context;
}
