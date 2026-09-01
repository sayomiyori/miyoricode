"use client";

import Image from "next/image";
import type { CarouselItem } from "@/lib/chat";
import { isSafeImageUrl } from "@/lib/chat";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  item: CarouselItem;
  onOpen: (item: CarouselItem) => void;
};

const GRADIENT_PRESETS: Record<string, string[]> = {
  purple: ["#a855f7", "#ec4899"],
  blue: ["#3b82f6", "#06b6d4"],
  orange: ["#f97316", "#facc15"],
  green: ["#22c55e", "#84cc16"],
  pink: ["#ec4899", "#f472b6"],
  cyan: ["#06b6d4", "#22d3ee"],
};

function getGradientStyle(item: CarouselItem): { background: string } | undefined {
  if (item.cover_gradient && item.cover_gradient.length >= 2) {
    return {
      background: `linear-gradient(135deg, ${item.cover_gradient[0]}, ${item.cover_gradient[1]})`,
    };
  }
  const preset = GRADIENT_PRESETS[item.category.toLowerCase()] ?? GRADIENT_PRESETS.purple;
  return {
    background: `linear-gradient(135deg, ${preset[0]}, ${preset[1]})`,
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
        "border border-white/20 shadow-lg",
        "transition-all duration-300 ease-out",
        "hover:scale-[1.03] hover:border-white/40 hover:shadow-xl",
        "active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
      )}
      style={!cover ? getGradientStyle(item) : undefined}
    >
      <div
        className={cn(
          "relative min-h-0 flex-1",
          cover ? "bg-[#111318]" : "bg-transparent",
        )}
      >
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            sizes="248px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
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
      <div className="shrink-0 bg-white/10 px-3.5 py-3 backdrop-blur-sm transition-colors duration-200 group-hover:bg-white/15">
        <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
      </div>
    </button>
  );
}
