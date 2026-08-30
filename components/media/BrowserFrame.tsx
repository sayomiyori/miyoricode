"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type BrowserFrameProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  objectFit?: "cover" | "contain";
};

export function BrowserFrame({
  src,
  alt,
  className,
  priority = false,
  sizes = "(max-width: 768px) 78vw, 280px",
  objectFit = "cover",
}: BrowserFrameProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border-2 border-ink/80",
        "shadow-[0_14px_28px_-10px_rgb(26_29_35_/_0.32)]",
        className,
      )}
    >
      <div
        className="flex h-8 items-center gap-1.5 bg-[#2a2d33] px-3"
        aria-hidden="true"
      >
        <span className="size-2.5 rounded-full bg-[#FF5F57]" />
        <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="size-2.5 rounded-full bg-[#28C840]" />
      </div>
      <div className="relative aspect-video bg-[#111318]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={objectFit === "contain" ? "object-contain" : "object-cover"}
        />
      </div>
    </div>
  );
}
