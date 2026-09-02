"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { ArrowRight, ExternalLink, X } from "lucide-react";
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
  technologiesLabel: string;
  yearLabel: string;
  onClose: () => void;
};

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: "easeOut" } },
};

const dialogVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
      when: "beforeChildren",
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

const screenshotsVariants: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function ProjectModal({
  item,
  closeLabel,
  demoLabel,
  linksLabel,
  screenshotsLabel,
  technologiesLabel,
  yearLabel,
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

  const demo = item.link && isSafeHttpUrl(item.link) ? item.link : null;
  const links = (Array.isArray(item.links) ? item.links : []).filter((link) =>
    isSafeHttpUrl(link.url),
  );
  const shots = (Array.isArray(item.screenshots) ? item.screenshots : []).filter(
    (shot) => isSafeImageUrl(shot.url),
  );
  const technologies = Array.isArray(item.technologies) ? item.technologies : [];
  const hasLinks = Boolean(demo) || links.length > 0;

  if (typeof document === "undefined") {
    return null;
  }

  return createPortal(
      <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 py-8 sm:py-12"
        role="presentation"
        key="modal-root"
      >
        <motion.button
          type="button"
          aria-label={closeLabel}
          onClick={onClose}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="fixed inset-0 z-0 cursor-pointer bg-ink/60 backdrop-blur-md"
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          variants={dialogVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.2 } }}
          className={cn(
            "relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl bg-white text-left shadow-2xl",
            "ring-1 ring-black/5",
          )}
        >
          <motion.button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            variants={itemVariants}
            className={cn(
              "absolute right-4 top-4 z-20 flex size-9 cursor-pointer items-center justify-center",
              "rounded-full bg-ink/85 text-white shadow-md backdrop-blur-sm",
              "transition-all duration-200 hover:scale-110 hover:bg-ink hover:rotate-90",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/50",
            )}
          >
            <X className="size-4" aria-hidden="true" strokeWidth={2.25} />
          </motion.button>

          <div className="px-7 pt-8 pb-6 sm:px-9 sm:pt-10">
            <motion.p
              variants={itemVariants}
              className="text-xs font-semibold uppercase tracking-wider text-ink/45"
            >
              {item.category}
            </motion.p>
            <motion.h2
              id={titleId}
              variants={itemVariants}
              className="mt-2 font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl"
            >
              {item.title}
            </motion.h2>
          </div>

          <motion.div
            variants={itemVariants}
            className="mx-7 mb-6 sm:mx-9 sm:mb-8"
          >
            <div className="rounded-2xl bg-[#f5f5f4] p-6 sm:p-7">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-ink/65 shadow-sm ring-1 ring-black/5">
                  {item.year || yearLabel}
                </span>
              </div>
              <p className="mt-4 text-[15px] leading-relaxed text-ink/80">
                {item.description}
              </p>

              {technologies.length > 0 ? (
                <div className="mt-6">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                    {technologiesLabel}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {technologies.map((tech) => (
                      <li
                        key={tech}
                        className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink/80 shadow-sm ring-1 ring-black/5"
                      >
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </motion.div>

          {hasLinks ? (
            <motion.section variants={itemVariants} className="mx-7 mb-6 sm:mx-9 sm:mb-8">
              <div className="flex items-center gap-2 pb-3">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                  {linksLabel}
                </h3>
                <span
                  aria-hidden="true"
                  className="text-ink/30"
                >
                  🔗
                </span>
              </div>
              <ul className="flex flex-col gap-2">
                {demo ? (
                  <li>
                    <a
                      href={demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "group flex w-full items-center justify-between gap-3 rounded-xl bg-[#f5f5f4] px-4 py-3",
                        "text-sm font-medium text-ink/85 transition-colors duration-200",
                        "hover:bg-[#ececeb] hover:text-ink",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30",
                      )}
                    >
                      <span className="inline-flex items-center gap-2">
                        <ExternalLink
                          className="size-4 shrink-0"
                          aria-hidden="true"
                          strokeWidth={1.75}
                        />
                        {demoLabel}
                      </span>
                      <ArrowRight
                        className="size-4 text-ink/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink"
                        strokeWidth={2}
                      />
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
                        "group flex w-full items-center justify-between gap-3 rounded-xl bg-[#f5f5f4] px-4 py-3",
                        "text-sm font-medium text-ink/85 transition-colors duration-200",
                        "hover:bg-[#ececeb] hover:text-ink",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30",
                      )}
                    >
                      <span className="inline-flex items-center gap-2">
                        <ExternalLink
                          className="size-4 shrink-0"
                          aria-hidden="true"
                          strokeWidth={1.75}
                        />
                        {link.label}
                      </span>
                      <ArrowRight
                        className="size-4 text-ink/40 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-ink"
                        strokeWidth={2}
                      />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.section>
          ) : null}

          {shots.length > 0 ? (
            <motion.section
              variants={screenshotsVariants}
              className="mx-7 mb-8 sm:mx-9 sm:mb-10"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink/45">
                {screenshotsLabel}
              </p>
              <ul className="mt-4 flex flex-col gap-5">
                {shots.map((shot) => (
                  <li
                    key={shot.url}
                    className={
                      shot.frame === "phone"
                        ? "mx-auto w-[10rem] sm:w-[11rem]"
                        : "w-full"
                    }
                  >
                    <FramedScreenshot
                      src={shot.url}
                      alt={shot.alt}
                      frame={shot.frame}
                      sizes={
                        shot.frame === "phone"
                          ? "(max-width: 768px) 36vw, 176px"
                          : "(max-width: 768px) 92vw, 640px"
                      }
                      objectFit="contain"
                    />
                  </li>
                ))}
              </ul>
            </motion.section>
          ) : null}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}
