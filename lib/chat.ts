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
  tagline: string | null;
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
  return Boolean(
    card &&
      card.type === "project_carousel" &&
      Array.isArray(card.items) &&
      card.items.length > 0,
  );
}

function isAttachmentImage(value: unknown): value is AttachmentImage {
  if (!value || typeof value !== "object") return false;
  const image = value as Record<string, unknown>;
  return (
    typeof image.url === "string" &&
    (image.frame === "phone" || image.frame === "browser") &&
    typeof image.alt === "string"
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

function asOptionalString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asYear(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

export function sanitizeAttachments(
  value: unknown,
): ChatAttachments | null {
  if (value == null || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const link = asOptionalString(raw.link);
  const images = Array.isArray(raw.images)
    ? raw.images.filter(isAttachmentImage)
    : null;
  return { link, images };
}

export function sanitizeCarouselItem(value: unknown): CarouselItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== "string" || typeof raw.title !== "string") return null;

  return {
    id: raw.id,
    title: raw.title,
    category: typeof raw.category === "string" ? raw.category : "",
    year: asYear(raw.year),
    tagline: asOptionalString(raw.tagline),
    cover_image: asOptionalString(raw.cover_image),
    cover_gradient: isStringArray(raw.cover_gradient) ? raw.cover_gradient : null,
    description: typeof raw.description === "string" ? raw.description : "",
    technologies: isStringArray(raw.technologies) ? raw.technologies : [],
    link: asOptionalString(raw.link),
    links: Array.isArray(raw.links) ? raw.links.filter(isCarouselLink) : [],
    screenshots: Array.isArray(raw.screenshots)
      ? raw.screenshots.filter(isAttachmentImage)
      : [],
  };
}

export function sanitizeCard(value: unknown): ChatCard | null {
  if (value == null || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (raw.type !== "project_carousel") return null;
  if (!Array.isArray(raw.items)) return null;
  const items = raw.items
    .map(sanitizeCarouselItem)
    .filter((item): item is CarouselItem => item !== null);
  if (items.length === 0) return null;
  return { type: "project_carousel", items };
}

export function sanitizeTurn(value: unknown): ChatTurn | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  if (typeof raw.id !== "string" || typeof raw.text !== "string") return null;
  if (raw.role !== "user" && raw.role !== "bot") return null;
  return {
    id: raw.id,
    role: raw.role,
    text: raw.text,
    attachments: sanitizeAttachments(raw.attachments),
    card: sanitizeCard(raw.card),
  };
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

/**
 * Derive a short single-line tagline for a project card.
 *
 * Falls back to the first sentence of `description` when no explicit
 * `tagline` is provided. Used by the showcase so cards stay scannable
 * while the full description lives inside the project modal.
 */
export function projectTagline(item: CarouselItem, maxLen = 90): string {
  if (item.tagline && item.tagline.trim().length > 0) {
    return truncate(item.tagline.trim(), maxLen);
  }
  const source = item.description.trim();
  if (source.length === 0) return "";
  const firstSentence = source.split(/[.!?\n]/, 1)[0]?.trim() ?? source;
  return truncate(firstSentence, maxLen);
}

function truncate(value: string, maxLen: number): string {
  if (value.length <= maxLen) return value;
  const cut = value.slice(0, maxLen - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
