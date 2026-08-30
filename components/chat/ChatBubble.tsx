"use client";

import { MessageAttachments } from "@/components/chat/MessageAttachments";
import type { ChatAttachments } from "@/lib/chat";
import { cn } from "@/lib/utils";

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
        "glass w-full min-w-0 px-4 py-3 text-left",
        "bg-white/10 backdrop-blur-md backdrop-saturate-150",
        "border border-white/20 shadow-lg",
      )}
    >
      <p className="whitespace-pre-wrap text-sm font-normal leading-relaxed wdth-normal text-ink md:text-[0.95rem]">
        {text}
      </p>
      <MessageAttachments
        attachments={attachments}
        openDemoLabel={openDemoLabel}
        closePreviewLabel={closePreviewLabel}
        previewTitle={previewTitle}
      />
    </article>
  );
}
