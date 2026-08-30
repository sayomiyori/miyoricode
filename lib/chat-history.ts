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

export function readStoredHistory(): ChatTurn[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.sessionStorage.getItem(CHAT_HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    const turns = extractTurns(parsed);
    if (!turns) return [];
    return markRestored(turns.map(sanitizeTurn).filter((turn) => turn !== null));
  } catch {
    return [];
  }
}

export function writeStoredHistory(turns: ChatTurn[]): void {
  try {
    if (typeof window === "undefined") return;
    const payload: PersistedHistory = {
      v: CHAT_HISTORY_VERSION,
      turns: turns.map(toPersistedTurn),
    };
    window.sessionStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(payload));
  } catch {
    // private mode / quota — in-memory history still works for this mount
  }
}
