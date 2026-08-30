"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { hasRenderableCard, type CarouselItem, type ChatCard } from "@/lib/chat";
import { cn } from "@/lib/utils";

type ProjectCarouselProps = {
  card: ChatCard | null | undefined;
  closeLabel: string;
  demoLabel: string;
  linksLabel: string;
  screenshotsLabel: string;
};

export function ProjectCarousel({
  card,
  closeLabel,
  demoLabel,
  linksLabel,
  screenshotsLabel,
}: ProjectCarouselProps) {
  const [open, setOpen] = useState<CarouselItem | null>(null);

  if (!hasRenderableCard(card)) {
    return null;
  }

  return (
    <div className="mt-3 min-w-0">
      <ul
        className={cn(
          "-mx-1 flex min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1",
          "[scrollbar-width:thin]",
        )}
      >
        {card.items.map((item) => (
          <li key={item.id} className="snap-start">
            <ProjectCard item={item} onOpen={setOpen} />
          </li>
        ))}
      </ul>
      {open ? (
        <ProjectModal
          item={open}
          closeLabel={closeLabel}
          demoLabel={demoLabel}
          linksLabel={linksLabel}
          screenshotsLabel={screenshotsLabel}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  );
}
