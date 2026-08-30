"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, X } from "lucide-react";
import { FramedScreenshot } from "@/components/media/FramedScreenshot";
import {
  isSafeHttpUrl,
  isSafeImageUrl,
  type CarouselItem,
} from "@/lib/chat";
import { cn } from "@/lib/utils";

type ProjectModalProps = {
  item: CarouselItem;
  closeLabel: string;
  demoLabel: string;
  linksLabel: string;
  screenshotsLabel: string;
  onClose: () => void;
};

export function ProjectModal({
  item,
  closeLabel,
  demoLabel,
  linksLabel,
  screenshotsLabel,
  onClose,
}: ProjectModalProps) {
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

  const demo =
    item.link && isSafeHttpUrl(item.link) ? item.link : null;
  const links = item.links.filter((link) => isSafeHttpUrl(link.url));
  const shots = item.screenshots.filter((shot) => isSafeImageUrl(shot.url));
  const hasLinks = Boolean(demo) || links.length > 0;

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-10"
      role="presentation"
    >
      <button
        type="button"
        className="fixed inset-0 cursor-pointer bg-ink/55 backdrop-blur-sm"
        aria-label={closeLabel}
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          "glass relative z-10 w-full max-w-3xl px-5 py-5 text-ink shadow-lg",
          "bg-white/15 border border-white/25",
        )}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className={cn(
            "absolute right-3 top-3 flex size-11 cursor-pointer items-center justify-center",
            "rounded-full bg-white/15 text-ink",
            "border border-white/25",
            "transition-colors duration-200 hover:bg-white/25",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
          )}
        >
          <X className="size-5" aria-hidden="true" strokeWidth={2} />
        </button>

        <div className="pr-12">
          <p className="text-xs font-medium tracking-wide text-ink/60">
            {item.category}
            <span className="mx-2 text-ink/30" aria-hidden="true">
              ·
            </span>
            {item.year}
          </p>
          <h2 id={titleId} className="mt-1 text-2xl font-semibold tracking-tight">
            {item.title}
          </h2>
        </div>

        <p className="mt-4 max-w-prose text-sm leading-relaxed text-ink/85">
          {item.description}
        </p>

        {item.technologies.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {item.technologies.map((tech) => (
              <li
                key={tech}
                className="rounded-full border border-white/25 bg-white/10 px-2.5 py-1 text-xs text-ink/80"
              >
                {tech}
              </li>
            ))}
          </ul>
        ) : null}

        {hasLinks ? (
          <section className="mt-5">
            <h3 className="text-xs font-medium uppercase tracking-wide text-ink/55">
              {linksLabel}
            </h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {demo ? (
                <li>
                  <a
                    href={demo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full",
                      "border border-white/25 bg-white/10 px-3.5 py-2 text-sm font-medium",
                      "transition-colors duration-200 hover:bg-white/20",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
                    )}
                  >
                    <ExternalLink
                      className="size-4 shrink-0"
                      aria-hidden="true"
                      strokeWidth={1.75}
                    />
                    {demoLabel}
                  </a>
                </li>
              ) : null}
              {links.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full",
                      "border border-white/25 bg-white/10 px-3.5 py-2 text-sm font-medium",
                      "transition-colors duration-200 hover:bg-white/20",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70",
                    )}
                  >
                    <ExternalLink
                      className="size-4 shrink-0"
                      aria-hidden="true"
                      strokeWidth={1.75}
                    />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {shots.length > 0 ? (
          <section className="mt-6">
            <h3 className="text-xs font-medium uppercase tracking-wide text-ink/55">
              {screenshotsLabel}
            </h3>
            <ul className="mt-3 flex flex-col gap-4">
              {shots.map((shot) => (
                <li
                  key={shot.url}
                  className={
                    shot.frame === "phone"
                      ? "mx-auto w-[11rem] md:w-[13rem]"
                      : "w-full"
                  }
                >
                  <FramedScreenshot
                    src={shot.url}
                    alt={shot.alt}
                    frame={shot.frame}
                    sizes={
                      shot.frame === "phone"
                        ? "(max-width: 768px) 44vw, 208px"
                        : "(max-width: 768px) 92vw, 720px"
                    }
                    objectFit={shot.frame === "browser" ? "contain" : "cover"}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
