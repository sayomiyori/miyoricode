import { sanitizeTurn, type ChatTurn } from "@/lib/chat";

export const CHAT_HISTORY_KEY = "chat-history";
export const CHAT_HISTORY_VERSION = 2;

type PersistedHistory = {
  v: number;
  turns: unknown;
};

function markRestored(turns: ChatTurn[]): ChatTurn[] {
  return turns.map((turn) => ({ ...turn, isRestored: true }));
}

function toPersistedTurn(turn: ChatTurn): Omit<ChatTurn, "isRestored"> {
  const { isRestored: _isRestored, ...rest } = turn;
  return rest;
}

function extractTurns(parsed: unknown): unknown[] | null {
  if (Array.isArray(parsed)) return parsed;

  if (!parsed || typeof parsed !== "object") return null;
  const envelope = parsed as PersistedHistory;
  if (typeof envelope.v !== "number" || !Array.isArray(envelope.turns)) {
    return null;
  }
  if (envelope.v > CHAT_HISTORY_VERSION) return null;
  return envelope.turns;
}

function readStoredHistoryRaw(key: string): ChatTurn[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    const turns = extractTurns(parsed);
    if (!turns) return [];
    return markRestored(turns.map(sanitizeTurn).filter((turn) => turn !== null));
  } catch {
    return [];
  }
}

function writeStoredHistoryRaw(key: string, turns: ChatTurn[]): void {
  try {
    if (typeof window === "undefined") return;
    const payload: PersistedHistory = {
      v: CHAT_HISTORY_VERSION,
      turns: turns.map(toPersistedTurn),
    };
    window.sessionStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // private mode / quota — in-memory history still works for this mount
  }
}

export function readStoredHistory(): ChatTurn[] {
  return readStoredHistoryRaw(CHAT_HISTORY_KEY);
}

export function writeStoredHistory(turns: ChatTurn[]): void {
  writeStoredHistoryRaw(CHAT_HISTORY_KEY, turns);
}

export const TOPIC_CHAT_KEY_PREFIX = "topic-chat";

export function topicChatKey(topic: string): string {
  return `${TOPIC_CHAT_KEY_PREFIX}:${topic}`;
}

export function readTopicHistory(topic: string): ChatTurn[] {
  return readStoredHistoryRaw(topicChatKey(topic));
}

export function writeTopicHistory(topic: string, turns: ChatTurn[]): void {
  writeStoredHistoryRaw(topicChatKey(topic), turns);
}
