"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProjectModal } from "@/components/projects/ProjectModal";
import { hasRenderableCard, type CarouselItem, type ChatCard } from "@/lib/chat";
import { useLocaleSwitch } from "@/components/layout/LocaleSwitchProvider";
import { cn } from "@/lib/utils";

const COVER_PRESETS: Record<string, string> = {
  "startup project": "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
  "fun tool": "linear-gradient(135deg, #f97316 0%, #facc15 100%)",
  "hackathon winner": "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  "ai": "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
  "saas": "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
  "tool": "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
  "web": "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
  "default": "linear-gradient(135deg, #a855f7 0%, #ec4899 100%)",
};

function getCoverStyle(item: CarouselItem): string {
  if (item.cover_gradient && item.cover_gradient.length >= 2) {
    return `linear-gradient(135deg, ${item.cover_gradient[0]} 0%, ${item.cover_gradient[1]} 100%)`;
  }
  const categoryKey = item.category.toLowerCase();
  for (const key of Object.keys(COVER_PRESETS)) {
    if (categoryKey.includes(key)) return COVER_PRESETS[key];
  }
  return COVER_PRESETS.default;
}

type ProjectsShowcaseProps = {
  card: ChatCard | null | undefined;
  closeLabel: string;
  demoLabel: string;
  linksLabel: string;
  screenshotsLabel: string;
};

export function ProjectsShowcase({
  card,
  closeLabel,
  demoLabel,
  linksLabel,
  screenshotsLabel,
}: ProjectsShowcaseProps) {
  const { messages } = useLocaleSwitch();
  const [open, setOpen] = useState<CarouselItem | null>(null);
  const [page, setPage] = useState(0);

  if (!hasRenderableCard(card)) {
    return null;
  }

  const items = card.items;
  const itemsPerPage = 2;
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = page * itemsPerPage;
  const visibleItems = items.slice(startIndex, startIndex + itemsPerPage);

  const goNext = () => setPage((p) => (p + 1) % totalPages);
  const goPrev = () => setPage((p) => (p - 1 + totalPages) % totalPages);

  return (
    <section className="w-full min-w-0">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-ink/50">
            {messages.projectsEyebrow}
          </p>
          <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {messages.projectsTitle}
          </h2>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous projects"
              className={cn(
                "flex size-10 cursor-pointer items-center justify-center",
                "rounded-full bg-white/15 text-ink shadow-lg border border-white/20 backdrop-blur-sm",
                "transition-all duration-200 hover:bg-white/25 hover:scale-110",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
              )}
            >
              <ChevronLeft className="size-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next projects"
              className={cn(
                "flex size-10 cursor-pointer items-center justify-center",
                "rounded-full bg-white/15 text-ink shadow-lg border border-white/20 backdrop-blur-sm",
                "transition-all duration-200 hover:bg-white/25 hover:scale-110",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
              )}
            >
              <ChevronRight className="size-5" strokeWidth={2} />
            </button>
          </div>
        )}
      </div>

      <motion.div
        key={page}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {visibleItems.map((item, index) => (
          <motion.button
            key={item.id}
            type="button"
            onClick={() => setOpen(item)}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.08, duration: 0.3 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className={cn(
              "group relative aspect-[3/4] w-full cursor-pointer overflow-hidden rounded-2xl text-left",
              "shadow-xl",
              "transition-shadow duration-300 hover:shadow-2xl",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
            )}
            style={{ background: getCoverStyle(item) }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute left-4 top-4 z-10">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium tracking-wide text-white backdrop-blur-md">
                {item.category}
              </span>
            </div>

            <div className="absolute inset-x-4 bottom-4 z-10 text-white">
              <h3 className="font-display text-2xl font-bold leading-tight tracking-tight drop-shadow-lg">
                {item.title}
              </h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-white/80">
                {item.year}
              </p>
            </div>

            <div className="absolute inset-0 bg-white/0 transition-colors duration-300 group-hover:bg-white/10" />
          </motion.button>
        ))}
      </motion.div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              aria-label={`Go to page ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === page
                  ? "w-8 bg-ink"
                  : "w-1.5 bg-ink/20 hover:bg-ink/40",
              )}
            />
          ))}
        </div>
      )}

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
    </section>
  );
}
