"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { postChat } from "@/lib/chat-api";
import { readStoredHistory, writeStoredHistory } from "@/lib/chat-history";
import type { ChatTurn } from "@/lib/chat";

const SESSION_STORAGE_KEY = "miyori-session-id";

function nextId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `turn-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStoredSession(): string | null {
  try {
    const value = sessionStorage.getItem(SESSION_STORAGE_KEY);
    return value && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

function persistSession(sessionId: string): void {
  if (!sessionId) return;
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  } catch {
    // private mode / quota — cookie + in-memory id still work
  }
}

export function useChat(lang: "en" | "ru", errorFallback: string) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setSessionId(readStoredSession());
  }, []);

  useLayoutEffect(() => {
    const stored = readStoredHistory();
    if (stored.length === 0) return;
    setTurns(stored);
  }, []);

  const commitTurns = useCallback(
    (updater: (current: ChatTurn[]) => ChatTurn[]) => {
      setTurns((current) => {
        const next = updater(current);
        writeStoredHistory(next);
        return next;
      });
    },
    [],
  );

  const rememberSession = useCallback((next: string) => {
    if (!next) return;
    setSessionId(next);
    persistSession(next);
  }, []);

  const send = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || pending) return;

      const userTurn: ChatTurn = {
        id: nextId(),
        role: "user",
        text: trimmed,
      };

      commitTurns((current) => [...current, userTurn]);
      setPending(true);
      void import("@/components/chat/BotMarkdown");

      try {
        const response = await postChat(trimmed, lang, sessionId);
        rememberSession(response.session_id);
        commitTurns((current) => [
          ...current,
          {
            id: nextId(),
            role: "bot",
            text: response.reply,
            attachments: response.attachments,
            card: response.card,
          },
        ]);
      } catch {
        commitTurns((current) => [
          ...current,
          {
            id: nextId(),
            role: "bot",
            text: errorFallback,
            attachments: null,
            card: null,
          },
        ]);
      } finally {
        setPending(false);
      }
    },
    [commitTurns, errorFallback, lang, pending, rememberSession, sessionId],
  );

  return { turns, pending, send };
}
