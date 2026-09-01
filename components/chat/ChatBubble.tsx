"use client";

import dynamic from "next/dynamic";
import { MessageAttachments } from "@/components/chat/MessageAttachments";
import { ProjectCarousel } from "@/components/projects/ProjectCarousel";
import { ProjectsShowcase } from "@/components/projects/ProjectsShowcase";
import { LocaleFade } from "@/components/layout/LocaleFade";
import { hasRenderableCard, type ChatAttachments, type ChatCard } from "@/lib/chat";
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
  thinkingLabel: string;
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
  thinkingLabel,
}: ChatBubbleProps) {
  const isThinking = text.length === 0;
  const hasCard = hasRenderableCard(card);
  return (
    <article
      className={cn(
        "glass flex w-full min-w-0 flex-col text-left shadow-lg",
        "bg-white/10 border border-white/20",
        hasCard ? "gap-4 px-4 py-4" : "gap-2 px-4 py-3",
        hasCard && "min-w-[20rem] sm:min-w-[34rem]",
      )}
      aria-busy={isThinking}
    >
      {hasCard ? (
        <>
          <ProjectsShowcase
            card={card}
            closeLabel={closeProjectLabel}
            demoLabel={openDemoLabel}
            linksLabel={projectLinksLabel}
            screenshotsLabel={projectScreenshotsLabel}
          />
          {isThinking ? (
            <span className="motion-safe:animate-pulse text-ink/70 text-sm">
              <LocaleFade>{thinkingLabel}</LocaleFade>
            </span>
          ) : (
            <BotMarkdown text={text} />
          )}
          <MessageAttachments
            attachments={attachments}
            openDemoLabel={openDemoLabel}
            closePreviewLabel={closePreviewLabel}
            previewTitle={previewTitle}
          />
        </>
      ) : (
        <>
          <div className="min-w-0 w-full">
            {isThinking ? (
              <span className="motion-safe:animate-pulse text-ink/70 text-sm">
                <LocaleFade>{thinkingLabel}</LocaleFade>
              </span>
            ) : (
              <BotMarkdown text={text} />
            )}
          </div>
          <MessageAttachments
            attachments={attachments}
            openDemoLabel={openDemoLabel}
            closePreviewLabel={closePreviewLabel}
            previewTitle={previewTitle}
          />
          <div className="w-full min-w-0 shrink-0">
            <ProjectCarousel
              card={card}
              closeLabel={closeProjectLabel}
              demoLabel={openDemoLabel}
              linksLabel={projectLinksLabel}
              screenshotsLabel={projectScreenshotsLabel}
            />
          </div>
        </>
      )}
    </article>
  );
}
