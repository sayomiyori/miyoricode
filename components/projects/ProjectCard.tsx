"use client";

import Image from "next/image";
import type { CarouselItem } from "@/lib/chat";
import { isSafeImageUrl } from "@/lib/chat";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  item: CarouselItem;
  onOpen: (item: CarouselItem) => void;
};

function coverStyle(item: CarouselItem): { backgroundImage: string } | undefined {
  if (!item.cover_gradient || item.cover_gradient.length < 2) return undefined;
  return {
    backgroundImage: `linear-gradient(135deg, ${item.cover_gradient[0]}, ${item.cover_gradient[1]})`,
  };
}

export function ProjectCard({ item, onOpen }: ProjectCardProps) {
  const cover = item.cover_image && isSafeImageUrl(item.cover_image)
    ? item.cover_image
    : null;

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      className={cn(
        "group relative flex h-[13.5rem] w-[15.5rem] shrink-0 cursor-pointer",
        "flex-col overflow-hidden rounded-2xl text-left",
        "border border-white/20 bg-white/10 shadow-lg",
        "transition-colors duration-200 hover:border-white/35 hover:bg-white/15",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
      )}
    >
      <div
        className="relative min-h-0 flex-1 bg-[#111318]"
        style={cover ? undefined : coverStyle(item)}
      >
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="248px"
            className="object-cover"
          />
        ) : null}
        <span
          className={cn(
            "absolute left-3 top-3 z-10 rounded-full px-2.5 py-1",
            "bg-ink/70 text-[11px] font-medium tracking-wide text-white",
            "backdrop-blur-sm",
          )}
        >
          {item.category}
        </span>
      </div>
      <div className="shrink-0 px-3.5 py-3">
        <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
      </div>
    </button>
  );
}
