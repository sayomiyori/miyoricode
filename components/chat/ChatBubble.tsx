"use client";

import dynamic from "next/dynamic";
import { MessageAttachments } from "@/components/chat/MessageAttachments";
import type { ChatAttachments } from "@/lib/chat";
import { cn } from "@/lib/utils";

const BotMarkdown = dynamic(
  () =>
    import("@/components/chat/BotMarkdown").then((mod) => mod.BotMarkdown),
);

type ChatBubbleProps = {
  text: string;
  attachments?: ChatAttachments | null;
  openDemoLabel: string;
  closePreviewLabel: string;
  previewTitle: string;
};

export function ChatBubble({
  text,
  attachments,
  openDemoLabel,
  closePreviewLabel,
  previewTitle,
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
    </article>
  );
}
