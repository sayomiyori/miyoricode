import type {
  AttachmentImage,
  CarouselItem,
  CarouselLink,
  ChatAttachments,
  ChatCard,
  ChatTurn,
} from "@/lib/chat";

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

function isCarouselLink(value: unknown): value is CarouselLink {
  if (!value || typeof value !== "object") return false;
  const link = value as Record<string, unknown>;
  return typeof link.label === "string" && typeof link.url === "string";
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isCarouselItem(value: unknown): value is CarouselItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || typeof item.title !== "string") {
    return false;
  }
  if (typeof item.category !== "string" || typeof item.year !== "string") {
    return false;
  }
  if (typeof item.description !== "string") return false;
  if (!isStringArray(item.technologies)) return false;
  if (item.cover_image != null && typeof item.cover_image !== "string") {
    return false;
  }
  if (item.cover_gradient != null && !isStringArray(item.cover_gradient)) {
    return false;
  }
  if (item.link != null && typeof item.link !== "string") return false;
  if (!Array.isArray(item.links) || !item.links.every(isCarouselLink)) {
    return false;
  }
  return (
    Array.isArray(item.screenshots) && item.screenshots.every(isAttachmentImage)
  );
}

function isChatCard(value: unknown): value is ChatCard {
  if (!value || typeof value !== "object") return false;
  const card = value as Record<string, unknown>;
  return (
    card.type === "project_carousel" &&
    Array.isArray(card.items) &&
    card.items.every(isCarouselItem)
  );
}

function isChatTurn(value: unknown): value is ChatTurn {
  if (!value || typeof value !== "object") return false;
  const turn = value as Record<string, unknown>;
  if (typeof turn.id !== "string" || typeof turn.text !== "string") {
    return false;
  }
  if (turn.role !== "user" && turn.role !== "bot") return false;
  if (turn.attachments != null && !isChatAttachments(turn.attachments)) {
    return false;
  }
  if (turn.card != null && !isChatCard(turn.card)) {
    return false;
  }
  return true;
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
