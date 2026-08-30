import { sanitizeAttachments, sanitizeCard, type ChatResponse } from "@/lib/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ChatRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatRequestError";
  }
}

function isChatResponse(value: unknown): value is ChatResponse {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return typeof body.reply === "string" && typeof body.session_id === "string";
}

export function parseChatPayload(payload: unknown): ChatResponse {
  if (!isChatResponse(payload)) {
    throw new ChatRequestError("invalid-response");
  }
  return {
    ...payload,
    attachments: sanitizeAttachments(payload.attachments),
    card: sanitizeCard(payload.card),
  };
}

export async function postChat(
  message: string,
  lang: "en" | "ru",
  sessionId: string | null,
): Promise<ChatResponse> {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      message,
      lang,
      session_id: sessionId,
    }),
  });

  // 429 is a designed chat payload, not a thrown fetch error. Any status
  // with { reply, session_id } renders as a normal bot turn.
  const payload: unknown = await response.json().catch(() => null);
  return parseChatPayload(payload);
}
