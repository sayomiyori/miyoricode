"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { useLocaleSwitch } from "@/components/layout/LocaleSwitchProvider";
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
  const { messages } = useLocaleSwitch();
  const [open, setOpen] = useState<CarouselItem | null>(null);
  const scrollRef = useRef<HTMLUListElement>(null);

  if (!hasRenderableCard(card)) {
    return null;
  }

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = 248 + 12;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative mt-3 min-w-0">
      <motion.ul
        ref={scrollRef}
        className={cn(
          "-mx-1 flex min-w-0 gap-3 overflow-x-auto px-1 pb-1",
          "snap-x snap-mandatory scroll-smooth",
          "[scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]",
        )}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {card.items.map((item, index) => (
          <motion.li
            key={item.id}
            className="snap-start"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
          >
            <ProjectCard item={item} onOpen={setOpen} />
          </motion.li>
        ))}
      </motion.ul>

      {card.items.length > 2 && (
        <>
          <button
            type="button"
            onClick={() => scroll("left")}
            className={cn(
              "absolute left-0 top-1/2 z-10 -translate-y-1/2",
              "flex size-8 cursor-pointer items-center justify-center",
              "rounded-full bg-white/15 text-ink shadow-lg",
              "border border-white/20 backdrop-blur-sm",
              "transition-all duration-200 hover:bg-white/25 hover:scale-110",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
            )}
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-4" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => scroll("right")}
            className={cn(
              "absolute right-0 top-1/2 z-10 -translate-y-1/2",
              "flex size-8 cursor-pointer items-center justify-center",
              "rounded-full bg-white/15 text-ink shadow-lg",
              "border border-white/20 backdrop-blur-sm",
              "transition-all duration-200 hover:bg-white/25 hover:scale-110",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
            )}
            aria-label="Scroll right"
          >
            <ChevronRight className="size-4" strokeWidth={2} />
          </button>
        </>
      )}

      {open ? (
        <ProjectModal
          item={open}
          closeLabel={closeLabel}
          demoLabel={demoLabel}
          linksLabel={linksLabel}
          screenshotsLabel={screenshotsLabel}
          technologiesLabel={messages.technologiesLabel}
          yearLabel={messages.yearLabel}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </div>
  );
}
