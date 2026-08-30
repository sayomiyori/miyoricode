"use client";

import dynamic from "next/dynamic";
import { MessageAttachments } from "@/components/chat/MessageAttachments";
import { ProjectCarousel } from "@/components/projects/ProjectCarousel";
import type { ChatAttachments, ChatCard } from "@/lib/chat";
import { cn } from "@/lib/utils";

const BotMarkdown = dynamic(
  () =>
    import("@/components/chat/BotMarkdown").then((mod) => mod.BotMarkdown),
);

type ChatBubbleProps = {
  text: string;
  attachments?: ChatAttachments | null;
  card?: ChatCard | null;
  openDemoLabel: string;
  closePreviewLabel: string;
  previewTitle: string;
  closeProjectLabel: string;
  projectLinksLabel: string;
  projectScreenshotsLabel: string;
};

export function ChatBubble({
  text,
  attachments,
  card,
  openDemoLabel,
  closePreviewLabel,
  previewTitle,
  closeProjectLabel,
  projectLinksLabel,
  projectScreenshotsLabel,
}: ChatBubbleProps) {
  return (
    <article
      className={cn(
        "glass w-full min-w-0 px-4 py-3 text-left shadow-lg",
        "bg-white/10 border border-white/20",
      )}
    >
      <BotMarkdown text={text} />
      <MessageAttachments
        attachments={attachments}
        openDemoLabel={openDemoLabel}
        closePreviewLabel={closePreviewLabel}
        previewTitle={previewTitle}
      />
      <ProjectCarousel
        card={card}
        closeLabel={closeProjectLabel}
        demoLabel={openDemoLabel}
        linksLabel={projectLinksLabel}
        screenshotsLabel={projectScreenshotsLabel}
      />
    </article>
  );
}
