"use client";

import { createContext, useContext, type ReactNode } from "react";

type TopicContextValue = {
  topic: string;
};

const TopicContext = createContext<TopicContextValue | null>(null);

export function TopicProvider({
  topic,
  children,
}: {
  topic: string;
  children: ReactNode;
}) {
  return <TopicContext.Provider value={{ topic }}>{children}</TopicContext.Provider>;
}

export function useTopicContext(): TopicContextValue {
  const context = useContext(TopicContext);
  if (!context) {
    throw new Error("useTopicContext must be used within TopicProvider");
  }
  return context;
}
