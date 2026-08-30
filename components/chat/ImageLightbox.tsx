"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { FramedScreenshot } from "@/components/media/FramedScreenshot";
import type { AttachmentImage } from "@/lib/chat";
import { cn } from "@/lib/utils";

type ImageLightboxProps = {
  image: AttachmentImage;
  closeLabel: string;
  title: string;
  onClose: () => void;
};

export function ImageLightbox({
  image,
  closeLabel,
  title,
  onClose,
}: ImageLightboxProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener("keydown", onKeyDown);
      previousFocus.current?.focus();
    };
  }, [onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-ink/55 backdrop-blur-sm"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "relative z-10 w-full",
          image.frame === "phone" ? "max-w-[18rem]" : "max-w-3xl",
        )}
      >
        <h2 id={titleId} className="sr-only">
          {title}
        </h2>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className={cn(
            "absolute -top-11 right-0 flex size-11 cursor-pointer items-center justify-center",
            "rounded-full bg-white/15 text-white backdrop-blur-md",
            "border border-white/25 shadow-lg",
            "transition-colors duration-200 hover:bg-white/25",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
          )}
        >
          <X className="size-5" aria-hidden="true" strokeWidth={2} />
        </button>
        <FramedScreenshot
          src={image.url}
          alt={image.alt}
          frame={image.frame}
          priority
        />
      </div>
    </div>,
    document.body,
  );
}
