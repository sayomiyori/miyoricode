"use client";

import { BrowserFrame } from "@/components/media/BrowserFrame";
import { PhoneFrame } from "@/components/media/PhoneFrame";
import type { ImageFrame } from "@/lib/chat";

type FramedScreenshotProps = {
  src: string;
  alt: string;
  frame: ImageFrame;
  priority?: boolean;
  sizes?: string;
  objectFit?: "cover" | "contain";
};

export function FramedScreenshot({
  src,
  alt,
  frame,
  priority,
  sizes,
  objectFit,
}: FramedScreenshotProps) {
  if (frame === "phone") {
    return <PhoneFrame src={src} alt={alt} priority={priority} sizes={sizes} />;
  }

  return (
    <BrowserFrame
      src={src}
      alt={alt}
      priority={priority}
      sizes={sizes}
      objectFit={objectFit}
    />
  );
}
