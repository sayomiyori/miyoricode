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

export type CarouselLink = {
  label: string;
  url: string;
};

export type CarouselItem = {
  id: string;
  title: string;
  category: string;
  year: string;
  cover_image: string | null;
  cover_gradient: string[] | null;
  description: string;
  technologies: string[];
  link: string | null;
  links: CarouselLink[];
  screenshots: AttachmentImage[];
};

export type ChatCard = {
  type: "project_carousel";
  items: CarouselItem[];
};

export type ChatSource = "structured" | "rag" | "fallback_declined";

export type ChatResponse = {
  reply: string;
  session_id: string;
  source: ChatSource;
  attachments: ChatAttachments | null;
  card: ChatCard | null;
};

export type ChatTurn = {
  id: string;
  role: "user" | "bot";
  text: string;
  attachments?: ChatAttachments | null;
  card?: ChatCard | null;
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

export function hasRenderableCard(
  card: ChatCard | null | undefined,
): card is ChatCard {
  return Boolean(card && card.type === "project_carousel" && card.items.length > 0);
}

export function isSafeImageUrl(url: string): boolean {
  if (url.includes("..")) return false;
  if (url.startsWith("/projects/")) return true;
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "raw.githubusercontent.com" &&
      parsed.pathname.startsWith("/sayomiyori/")
    );
  } catch {
    return false;
  }
}

export function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}
