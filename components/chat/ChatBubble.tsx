"use client";

import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import { MessageAttachments } from "@/components/chat/MessageAttachments";
import { ProjectCarousel } from "@/components/projects/ProjectCarousel";
import { ProjectsShowcase } from "@/components/projects/ProjectsShowcase";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { LocaleFade } from "@/components/layout/LocaleFade";
import {
  hasRenderableCard,
  projectMeta,
  type CarouselItem,
  type ChatAttachments,
  type ChatCard,
} from "@/lib/chat";
import { useState } from "react";
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
  viewDetailsLabel: string;
  highlightsLabel: string;
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
  viewDetailsLabel,
  highlightsLabel,
}: ChatBubbleProps) {
  const isThinking = text.length === 0;
  const hasCard = hasRenderableCard(card);
  const [open, setOpen] = useState<CarouselItem | null>(null);

  return (
    <article
      className={cn(
        "glass flex w-full min-w-0 flex-col text-left shadow-lg",
        "bg-white/10 border border-white/20",
        hasCard ? "gap-4 px-4 py-4" : "gap-2 px-4 py-3",
        hasCard && "min-w-[20rem] sm:min-w-[48rem]",
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
            viewDetailsLabel={viewDetailsLabel}
          />

          <div className="mt-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
              {highlightsLabel}
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {card.items.map((item) => {
                const meta = projectMeta(item);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setOpen(item)}
                      className={cn(
                        "group flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left",
                        "text-sm text-ink/85 transition-colors duration-200",
                        "hover:bg-white/10 hover:text-ink",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
                      )}
                    >
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-splat-blue/70" />
                      <span className="min-w-0 flex-1">
                        <span className="font-semibold">{item.title}</span>
                        {meta ? (
                          <span className="text-ink/55"> · {meta}</span>
                        ) : null}
                      </span>
                      <ArrowUpRight
                        className="mt-0.5 size-4 shrink-0 text-ink/40 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink"
                        strokeWidth={2}
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {isThinking ? (
            <span className="motion-safe:animate-pulse text-ink/70 text-sm">
              <LocaleFade>{thinkingLabel}</LocaleFade>
            </span>
          ) : null}

          <MessageAttachments
            attachments={attachments}
            openDemoLabel={openDemoLabel}
            closePreviewLabel={closePreviewLabel}
            previewTitle={previewTitle}
          />

          {open ? (
            <ProjectModal
              item={open}
              closeLabel={closeProjectLabel}
              demoLabel={openDemoLabel}
              linksLabel={projectLinksLabel}
              screenshotsLabel={projectScreenshotsLabel}
              onClose={() => setOpen(null)}
            />
          ) : null}
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
