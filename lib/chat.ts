export type ImageFrame = "phone" | "browser";

export type AttachmentImage = {
  url: string;
  frame: ImageFrame;
  alt: string;
};

export type ChatAttachments = {
  link: string | null;
  images: AttachmentImage[] | null;
};

export type ChatSource = "structured" | "rag" | "fallback_declined";

export type ChatResponse = {
  reply: string;
  session_id: string;
  source: ChatSource;
  attachments: ChatAttachments | null;
};

export type ChatTurn = {
  id: string;
  role: "user" | "bot";
  text: string;
  attachments?: ChatAttachments | null;
  isRestored?: boolean;
};

export function hasRenderableAttachments(
  attachments: ChatAttachments | null | undefined,
): attachments is ChatAttachments {
  if (!attachments) return false;
  const hasLink =
    typeof attachments.link === "string" && attachments.link.trim().length > 0;
  const hasImages =
    Array.isArray(attachments.images) && attachments.images.length > 0;
  return hasLink || hasImages;
}

export function isSafeImageUrl(url: string): boolean {
  return url.startsWith("/projects/") && !url.includes("..");
}

export function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}
