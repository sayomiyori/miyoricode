import { sanitizeAttachments, sanitizeCard, type ChatSource } from "@/lib/chat";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ChatRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChatRequestError";
  }
}

export type ChatMetadata = {
  card: unknown;
  attachments: unknown;
  session_id: string;
  source: ChatSource | string;
};

export type ChatDone = {
  session_id: string;
  source: ChatSource | string;
  reason?: string | null;
};

export type ChatHandlers = {
  onMetadata?: (data: ChatMetadata) => void;
  onToken?: (text: string) => void;
  onDone?: (data: ChatDone) => void;
};

export type ChatPostOptions = ChatHandlers & {
  signal?: AbortSignal;
};

/**
 * 429 rate-limit responses are NOT SSE — they're regular JSON payloads
 * that already conform to the legacy { reply, session_id } contract.
 * Keep that branch intact and surface the result through the same callbacks
 * so the caller doesn't need a separate code path.
 */
type Legacy429Payload = {
  reply: string;
  session_id: string;
  source?: ChatSource | string;
  attachments?: unknown;
  card?: unknown;
};

function isLegacy429Payload(value: unknown): value is Legacy429Payload {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return typeof body.reply === "string" && typeof body.session_id === "string";
}

function parseLegacyPayload(payload: unknown): Legacy429Payload {
  if (!isLegacy429Payload(payload)) {
    throw new ChatRequestError("invalid-response");
  }
  return payload;
}

/**
 * Read a Server-Sent Events stream into individual events.
 *
 * The wire format we expect from the backend:
 *
 *   event: metadata
 *   data: {"card": ..., "attachments": ..., "session_id": "...", "source": "..."}
 *
 *   event: token
 *   data: {"text": "..."}
 *
 *   ...
 *
 *   event: done
 *   data: {"source": "...", "session_id": "..."}
 *
 * Chunks can arrive split across arbitrary boundaries, so we accumulate a
 * string buffer and split on the SSE record separator "\n\n". Within each
 * record we collect lines until we see a blank line, then dispatch.
 */
async function readSseStream(
  body: ReadableStream<Uint8Array>,
  handlers: ChatHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  const dispatchEvent = (rawEvent: string) => {
    const event = rawEvent.replace(/\r$/, "");
    if (!event) return;

    let eventName = "message";
    const dataLines: string[] = [];

    for (const line of event.split("\n")) {
      if (line.startsWith(":")) continue;
      const colon = line.indexOf(":");
      if (colon === -1) continue;
      const field = line.slice(0, colon);
      let value = line.slice(colon + 1);
      if (value.startsWith(" ")) value = value.slice(1);
      if (field === "event") {
        eventName = value;
      } else if (field === "data") {
        dataLines.push(value);
      } else if (field === "id" || field === "retry") {
        // SSE bookkeeping we don't currently need. Ignored.
      }
    }

    if (dataLines.length === 0) return;
    const dataRaw = dataLines.join("\n");

    let parsed: unknown;
    try {
      parsed = JSON.parse(dataRaw);
    } catch {
      return;
    }

    if (eventName === "metadata" && parsed && typeof parsed === "object") {
      const meta = parsed as Record<string, unknown>;
      if (typeof meta.session_id === "string" && handlers.onMetadata) {
        handlers.onMetadata({
          card: meta.card,
          attachments: meta.attachments,
          session_id: meta.session_id,
          source: (meta.source as ChatSource | string | undefined) ?? "structured",
        });
      }
      return;
    }

    if (eventName === "token" && parsed && typeof parsed === "object") {
      const token = parsed as Record<string, unknown>;
      if (typeof token.text === "string" && handlers.onToken) {
        handlers.onToken(token.text);
      }
      return;
    }

    if (eventName === "done" && parsed && typeof parsed === "object") {
      const done = parsed as Record<string, unknown>;
      if (typeof done.session_id === "string" && handlers.onDone) {
        handlers.onDone({
          session_id: done.session_id,
          source: (done.source as ChatSource | string | undefined) ?? "structured",
          reason: typeof done.reason === "string" ? done.reason : null,
        });
      }
      return;
    }
  };

  try {
    while (true) {
      if (signal?.aborted) {
        throw new ChatRequestError("aborted");
      }
      const { value, done } = await reader.read();
      if (done) break;
      if (value) {
        buffer += decoder.decode(value, { stream: true });
      }

      let sepIndex = buffer.indexOf("\n\n");
      while (sepIndex !== -1) {
        const rawEvent = buffer.slice(0, sepIndex);
        buffer = buffer.slice(sepIndex + 2);
        dispatchEvent(rawEvent);
        sepIndex = buffer.indexOf("\n\n");
      }
    }

    // Flush any trailing buffered event that didn't end with a blank line.
    if (buffer.trim().length > 0) {
      dispatchEvent(buffer);
      buffer = "";
    }
  } catch (error) {
    reader.releaseLock?.();
    if (error instanceof ChatRequestError) throw error;
    throw new ChatRequestError(
      error instanceof Error ? error.message : "stream-failed",
    );
  } finally {
    reader.releaseLock?.();
  }
}

export async function postChat(
  message: string,
  lang: "en" | "ru",
  sessionId: string | null,
  options: ChatPostOptions = {},
): Promise<void> {
  const { onMetadata, onToken, onDone, signal } = options;
  const handlers: ChatHandlers = { onMetadata, onToken, onDone };

  let response: Response;
  try {
    response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        message,
        lang,
        session_id: sessionId,
      }),
      signal,
    });
  } catch (error) {
    throw new ChatRequestError(
      error instanceof Error ? error.message : "network-failed",
    );
  }

  if (response.status === 429) {
    const payload: unknown = await response.json().catch(() => null);
    const legacy = parseLegacyPayload(payload);
    handlers.onMetadata?.({
      card: legacy.card ?? null,
      attachments: legacy.attachments ?? null,
      session_id: legacy.session_id,
      source: (legacy.source as ChatSource | string | undefined) ?? "structured",
    });
    if (legacy.reply.length > 0) {
      handlers.onToken?.(legacy.reply);
    }
    handlers.onDone?.({
      session_id: legacy.session_id,
      source: (legacy.source as ChatSource | string | undefined) ?? "structured",
      reason: "rate_limited",
    });
    return;
  }

  if (!response.ok) {
    throw new ChatRequestError(`http-${response.status}`);
  }

  if (!response.body) {
    throw new ChatRequestError("empty-body");
  }

  await readSseStream(response.body, handlers, signal);
}

/**
 * Exposed for tests so we can validate sanitize wiring in unit tests without
 * pulling the fetch/SSE pipeline apart. Not used at the UI boundary.
 */
export function sanitizeChatExtras(value: {
  attachments: unknown;
  card: unknown;
}): { attachments: ReturnType<typeof sanitizeAttachments>; card: ReturnType<typeof sanitizeCard> } {
  return {
    attachments: sanitizeAttachments(value.attachments),
    card: sanitizeCard(value.card),
  };
}