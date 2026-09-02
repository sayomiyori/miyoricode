"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { postChat } from "@/lib/chat-api";
import { readStoredHistory, writeStoredHistory } from "@/lib/chat-history";
import {
  sanitizeAttachments,
  sanitizeCard,
  type ChatTurn,
} from "@/lib/chat";

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

function guardrailReasonToMessage(reason: string | null | undefined, fallback: string): string {
  if (!reason) return fallback;
  if (reason === "output_filter" || reason === "rate_limited") {
    return fallback;
  }
  return fallback;
}

export function useChat(lang: "en" | "ru", errorFallback: string) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const streamingTurnIdRef = useRef<string | null>(null);

  useEffect(() => {
    setSessionId(readStoredSession());
  }, []);

  // Clear stale, language-bound history when the user switches locale.
  // The bot's previous reply is tied to the language it was generated in,
  // so re-rendering it in a new language would produce a mixed bag.
  useEffect(() => {
    setTurns([]);
    writeStoredHistory([]);
  }, [lang]);

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

  const finalizeStreamingTurn = useCallback(
    (mutate: (turn: ChatTurn) => ChatTurn | null) => {
      const streamingId = streamingTurnIdRef.current;
      if (!streamingId) return;
      commitTurns((current) =>
        current.map((turn) => (turn.id === streamingId ? mutate(turn) ?? turn : turn)),
      );
    },
    [commitTurns],
  );

  const send = useCallback(
    async (message: string) => {
      const trimmed = message.trim();
      if (!trimmed || pending) return;

      const userTurn: ChatTurn = {
        id: nextId(),
        role: "user",
        text: trimmed,
      };
      const botTurn: ChatTurn = {
        id: nextId(),
        role: "bot",
        text: "",
        attachments: null,
        card: null,
      };
      streamingTurnIdRef.current = botTurn.id;

      commitTurns((current) => [...current, userTurn, botTurn]);
      setPending(true);
      void import("@/components/chat/BotMarkdown");

      try {
        await postChat(trimmed, lang, sessionId, {
          onMetadata: (meta) => {
            rememberSession(meta.session_id);
            finalizeStreamingTurn((turn) => ({
              ...turn,
              attachments: sanitizeAttachments(meta.attachments),
              card: sanitizeCard(meta.card),
            }));
          },
          onToken: (text) => {
            finalizeStreamingTurn((turn) => ({
              ...turn,
              text: turn.text + text,
            }));
          },
          onDone: (done) => {
            rememberSession(done.session_id);
            if (done.reason === "output_filter") {
              finalizeStreamingTurn((turn) =>
                turn.text.length > 0
                  ? turn
                  : { ...turn, text: guardrailReasonToMessage(done.reason, errorFallback) },
              );
            }
          },
        });
      } catch {
        const streamingId = streamingTurnIdRef.current;
        commitTurns((current) =>
          current.map((turn) =>
            turn.id === streamingId
              ? {
                  ...turn,
                  text: turn.text.length > 0 ? turn.text : errorFallback,
                  attachments: null,
                  card: null,
                }
              : turn,
          ),
        );
      } finally {
        streamingTurnIdRef.current = null;
        setPending(false);
      }
    },
    [
      commitTurns,
      errorFallback,
      finalizeStreamingTurn,
      lang,
      pending,
      rememberSession,
      sessionId,
    ],
  );

  return { turns, pending, send };
}