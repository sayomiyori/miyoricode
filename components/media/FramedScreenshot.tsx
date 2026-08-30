"use client";

import { BrowserFrame } from "@/components/media/BrowserFrame";
import { PhoneFrame } from "@/components/media/PhoneFrame";
import type { ImageFrame } from "@/lib/chat";

type FramedScreenshotProps = {
  src: string;
  alt: string;
  frame: ImageFrame;
  priority?: boolean;
};

export function FramedScreenshot({
  src,
  alt,
  frame,
  priority,
}: FramedScreenshotProps) {
  if (frame === "phone") {
    return <PhoneFrame src={src} alt={alt} priority={priority} />;
  }

  return <BrowserFrame src={src} alt={alt} priority={priority} />;
}
