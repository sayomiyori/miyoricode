"use client";

import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { ImageLightbox } from "@/components/chat/ImageLightbox";
import { FramedScreenshot } from "@/components/media/FramedScreenshot";
import {
  hasRenderableAttachments,
  isSafeHttpUrl,
  isSafeImageUrl,
  type AttachmentImage,
  type ChatAttachments,
} from "@/lib/chat";
import { cn } from "@/lib/utils";

type MessageAttachmentsProps = {
  attachments: ChatAttachments | null | undefined;
  openDemoLabel: string;
  closePreviewLabel: string;
  previewTitle: string;
};

export function MessageAttachments({
  attachments,
  openDemoLabel,
  closePreviewLabel,
  previewTitle,
}: MessageAttachmentsProps) {
  const [preview, setPreview] = useState<AttachmentImage | null>(null);

  if (!hasRenderableAttachments(attachments)) {
    return null;
  }

  const link =
    attachments.link && isSafeHttpUrl(attachments.link)
      ? attachments.link
      : null;
  const images = (attachments.images ?? []).filter((image) =>
    isSafeImageUrl(image.url),
  );

  if (!link && images.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 flex min-w-0 flex-col items-start gap-3">
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "glass inline-flex cursor-pointer items-center gap-2 px-3.5 py-2.5",
            "text-sm font-medium wdth-normal text-ink",
            "bg-white/10 backdrop-blur-md backdrop-saturate-150",
            "border border-white/20 shadow-lg",
            "transition-colors duration-200 hover:bg-white/20",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
          )}
        >
          <ExternalLink
            className="size-4 shrink-0"
            aria-hidden="true"
            strokeWidth={1.75}
          />
          <span>{openDemoLabel}</span>
        </a>
      ) : null}

      {images.length > 0 ? (
        <ul
          className={cn(
            "-mx-1 flex min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-1",
            "md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0",
            "[scrollbar-width:thin]",
          )}
        >
          {images.map((image) => (
            <li
              key={image.url}
              className={cn(
                "snap-start shrink-0",
                image.frame === "phone"
                  ? "w-[8.75rem] md:w-[11rem] md:justify-self-center"
                  : "w-[min(16.5rem,78vw)] md:w-full",
              )}
            >
              <button
                type="button"
                onClick={() => setPreview(image)}
                className={cn(
                  "block w-full cursor-pointer rounded-[1.15rem]",
                  "transition-opacity duration-200 hover:opacity-90",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                )}
              >
                <FramedScreenshot
                  src={image.url}
                  alt={image.alt}
                  frame={image.frame}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {preview ? (
        <ImageLightbox
          image={preview}
          closeLabel={closePreviewLabel}
          title={previewTitle}
          onClose={() => setPreview(null)}
        />
      ) : null}
    </div>
  );
}
