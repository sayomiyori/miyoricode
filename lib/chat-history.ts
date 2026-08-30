import type { AttachmentImage, ChatAttachments, ChatTurn } from "@/lib/chat";

export const CHAT_HISTORY_KEY = "chat-history";

function isAttachmentImage(value: unknown): value is AttachmentImage {
  if (!value || typeof value !== "object") return false;
  const image = value as Record<string, unknown>;
  return (
    typeof image.url === "string" &&
    (image.frame === "phone" || image.frame === "browser") &&
    typeof image.alt === "string"
  );
}

function isChatAttachments(value: unknown): value is ChatAttachments {
  if (!value || typeof value !== "object") return false;
  const attachments = value as Record<string, unknown>;
  if (attachments.link != null && typeof attachments.link !== "string") {
    return false;
  }
  if (attachments.images == null) return true;
  return (
    Array.isArray(attachments.images) &&
    attachments.images.every(isAttachmentImage)
  );
}

function isChatTurn(value: unknown): value is ChatTurn {
  if (!value || typeof value !== "object") return false;
  const turn = value as Record<string, unknown>;
  if (typeof turn.id !== "string" || typeof turn.text !== "string") {
    return false;
  }
  if (turn.role !== "user" && turn.role !== "bot") return false;
  if (turn.attachments == null) return true;
  return isChatAttachments(turn.attachments);
}

function isChatTurnArray(value: unknown): value is ChatTurn[] {
  return Array.isArray(value) && value.every(isChatTurn);
}

function markRestored(turns: ChatTurn[]): ChatTurn[] {
  return turns.map((turn) => ({ ...turn, isRestored: true }));
}

function toPersistedTurn(turn: ChatTurn): Omit<ChatTurn, "isRestored"> {
  const { isRestored: _isRestored, ...rest } = turn;
  return rest;
}

export function readStoredHistory(): ChatTurn[] {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.sessionStorage.getItem(CHAT_HISTORY_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return isChatTurnArray(parsed) ? markRestored(parsed) : [];
  } catch {
    return [];
  }
}

export function writeStoredHistory(turns: ChatTurn[]): void {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(
      CHAT_HISTORY_KEY,
      JSON.stringify(turns.map(toPersistedTurn)),
    );
  } catch {
    // private mode / quota — in-memory history still works for this mount
  }
}
