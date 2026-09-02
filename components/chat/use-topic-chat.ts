"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { postChat } from "@/lib/chat-api";
import { type ChatTurn } from "@/lib/chat";
import {
  readTopicHistory,
  writeTopicHistory,
} from "@/lib/chat-history";
import { SHORTCUT_PROMPTS } from "@/lib/shortcut-prompts";
import {
  sanitizeAttachments,
  sanitizeCard,
} from "@/lib/chat";
import type { Locale } from "@/i18n/routing";

const SESSION_STORAGE_KEY_PREFIX = "topic-session";

function nextId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `turn-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readStoredSession(topic: string): string | null {
  try {
    const value = sessionStorage.getItem(`${SESSION_STORAGE_KEY_PREFIX}:${topic}`);
    return value && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

function persistSession(topic: string, sessionId: string): void {
  if (!sessionId) return;
  try {
    sessionStorage.setItem(`${SESSION_STORAGE_KEY_PREFIX}:${topic}`, sessionId);
  } catch {
    // private mode / quota
  }
}

export function useTopicChat(
  topic: string,
  lang: "en" | "ru",
  errorFallback: string,
) {
  const [turns, setTurns] = useState<ChatTurn[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const streamingTurnIdRef = useRef<string | null>(null);
  const autoFiredRef = useRef(false);

  useEffect(() => {
    setSessionId(readStoredSession(topic));
  }, [topic]);

  useLayoutEffect(() => {
    const stored = readTopicHistory(topic);
    if (stored.length === 0) return;
    setTurns(stored);
  }, [topic]);

  // Clear stale, language-bound history when the user switches locale.
  // The bot's previous reply is tied to the language it was generated in,
  // so re-rendering it in a new language would produce a mixed bag.
  // Also reset the auto-prompt guard so the welcome prompt fires again
  // in the new locale.
  useEffect(() => {
    setTurns([]);
    writeTopicHistory(topic, []);
    autoFiredRef.current = false;
  }, [lang, topic]);

  const commitTurns = useCallback(
    (updater: (current: ChatTurn[]) => ChatTurn[]) => {
      setTurns((current) => {
        const next = updater(current);
        writeTopicHistory(topic, next);
        return next;
      });
    },
    [topic],
  );

  const rememberSession = useCallback(
    (next: string) => {
      if (!next) return;
      setSessionId(next);
      persistSession(topic, next);
    },
    [topic],
  );

  const finalizeStreamingTurn = useCallback(
    (mutate: (turn: ChatTurn) => ChatTurn | null) => {
      const streamingId = streamingTurnIdRef.current;
      if (!streamingId) return;
      commitTurns((current) =>
        current.map((turn) =>
          turn.id === streamingId ? mutate(turn) ?? turn : turn,
        ),
      );
    },
    [commitTurns],
  );

  const send = useCallback(
    async (message: string, auto = false) => {
      const trimmed = message.trim();
      if (!trimmed || (pending && !auto)) return;

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
          topic,
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
                  : { ...turn, text: errorFallback },
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
      topic,
    ],
  );

  // Auto-prompt on first mount when history is empty.
  // Guarding on pending + autoFiredRef prevents double-fire if component
  // re-renders before the first request completes.
  useEffect(() => {
    if (autoFiredRef.current || pending) return;
    const stored = readTopicHistory(topic);
    if (stored.length > 0) return;
    autoFiredRef.current = true;
    const prompt = SHORTCUT_PROMPTS[lang]?.[topic as keyof typeof SHORTCUT_PROMPTS.en];
    if (!prompt) return;
    void send(prompt, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic, lang]);

  return { turns, pending, send };
}
