"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type PhoneFrameProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export function PhoneFrame({
  src,
  alt,
  className,
  priority = false,
  sizes = "(max-width: 768px) 42vw, 180px",
}: PhoneFrameProps) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-[2rem] border-[9px] border-ink",
        "shadow-[0_14px_28px_-10px_rgb(26_29_35_/_0.38)]",
        "bg-ink",
        className,
      )}
    >
      <div className="relative aspect-[9/19.5]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain"
        />
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-[6px] z-10 h-3.5 w-[4.25rem] -translate-x-1/2 rounded-full bg-black"
        aria-hidden="true"
      />
    </div>
  );
}
