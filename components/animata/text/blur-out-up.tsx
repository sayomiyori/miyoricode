"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import "./text-animator.css";

export interface TextAnimationFrameSpec {
  opacity?: number;
  xPx?: number;
  yPx?: number;
  zPx?: number;
  scale?: number;
  rotateDeg?: number;
  rotateXDeg?: number;
  rotateYDeg?: number;
  blurPx?: number;
}

export interface TextAnimationPhaseSpec {
  durationMs: number;
  staggerMs: number;
  easing: string;
  from: TextAnimationFrameSpec;
  to: TextAnimationFrameSpec;
}

export interface TextAnimationSpec {
  id?: string;
  target?: "whole" | "per-character" | "per-word" | "per-line";
  enter: TextAnimationPhaseSpec;
  exit: TextAnimationPhaseSpec;
  swap?: {
    mode?: string;
    overlapMs?: number;
    microDelayMs?: number;
  };
}

/** Spec from animata.design `text/blur-out-up`. */
export const BLUR_OUT_UP_SPEC: TextAnimationSpec = {
  id: "blur-out-up",
  target: "per-word",
  enter: {
    durationMs: 560,
    staggerMs: 28,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
    from: { opacity: 0, yPx: 10, blurPx: 6 },
    to: { opacity: 1, yPx: 0, blurPx: 0 },
  },
  exit: {
    durationMs: 480,
    staggerMs: 24,
    easing: "cubic-bezier(0.64, 0, 0.78, 0)",
    from: { opacity: 1, yPx: 0, blurPx: 0 },
    to: { opacity: 0, yPx: -14, blurPx: 8 },
  },
  swap: {
    mode: "sequential",
    microDelayMs: 35,
  },
};

const DEFAULT_SPEED = 0.72;
const DEFAULT_Y_TRAVEL = 0.58;

type TextPart = { text: string; animate: boolean };

function splitTextByTarget(
  text: string,
  target: TextAnimationSpec["target"] = "per-word",
): TextPart[] {
  if (target === "whole") return [{ text, animate: true }];
  if (target === "per-line") {
    return text.split("\n").map((line) => ({ text: line, animate: true }));
  }
  if (target === "per-word") {
    return [...text.matchAll(/(\S+|\s+)/g)].map((match) => ({
      text: match[0],
      animate: /\S/.test(match[0]),
    }));
  }
  return [...text].map((character) => ({ text: character, animate: true }));
}

export function countAnimatableUnits(
  text: string,
  target: TextAnimationSpec["target"] = "per-word",
): number {
  return splitTextByTarget(text, target).filter((part) => part.animate).length;
}

function toKeyframe(
  values: TextAnimationFrameSpec,
  yTravel: number,
): Keyframe {
  return {
    filter: `blur(${values.blurPx ?? 0}px)`,
    opacity: values.opacity ?? 1,
    transform: `translate3d(${values.xPx ?? 0}px, ${(values.yPx ?? 0) * yTravel}px, ${
      values.zPx ?? 0
    }px) rotateX(${values.rotateXDeg ?? 0}deg) rotateY(${values.rotateYDeg ?? 0}deg) rotate(${
      values.rotateDeg ?? 0
    }deg) scale(${values.scale ?? 1})`,
  };
}

export function phaseDurationMs(
  phase: TextAnimationPhaseSpec,
  unitCount: number,
  speed = DEFAULT_SPEED,
): number {
  const duration = Math.max(140, Math.round(phase.durationMs * speed));
  const delayStep = Math.max(0, Math.round(phase.staggerMs * speed));
  return duration + Math.max(0, unitCount - 1) * delayStep;
}

export function getTextSwapDuration(
  from: string,
  to: string,
  spec: TextAnimationSpec = BLUR_OUT_UP_SPEC,
  speed = DEFAULT_SPEED,
): number {
  if (from === to) return 0;
  const exitMs = phaseDurationMs(
    spec.exit,
    countAnimatableUnits(from, spec.target),
    speed,
  );
  const enterMs = phaseDurationMs(
    spec.enter,
    countAnimatableUnits(to, spec.target),
    speed,
  );
  return exitMs + (spec.swap?.microDelayMs ?? 0) + enterMs;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function animatePhase(
  units: HTMLElement[],
  phase: TextAnimationPhaseSpec,
  speed: number,
  yTravel: number,
): { animations: Animation[]; duration: number } {
  const from = toKeyframe(phase.from, yTravel);
  const to = toKeyframe(phase.to, yTravel);
  const duration = Math.max(140, Math.round(phase.durationMs * speed));
  const delayStep = Math.max(0, Math.round(phase.staggerMs * speed));

  const animations = units.map((unit, index) =>
    unit.animate([from, to], {
      delay: index * delayStep,
      duration,
      easing: phase.easing,
      fill: "forwards",
    }),
  );

  return {
    animations,
    duration: duration + Math.max(0, units.length - 1) * delayStep,
  };
}

function unitsOf(root: HTMLElement | null): HTMLElement[] {
  if (!root) return [];
  return [...root.querySelectorAll<HTMLElement>("[data-anim-unit]")];
}

export interface BlurOutUpProps {
  text: string;
  className?: string;
  speed?: number;
  yTravel?: number;
}

export default function BlurOutUp({
  text,
  className,
  speed = DEFAULT_SPEED,
  yTravel = DEFAULT_Y_TRAVEL,
}: BlurOutUpProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(text);
  const [phase, setPhase] = useState<"idle" | "exiting" | "entering">("idle");
  const pendingRef = useRef(text);
  const animationsRef = useRef<Animation[]>([]);

  function cancelAnimations() {
    animationsRef.current.forEach((animation) => animation.cancel());
    animationsRef.current = [];
  }

  useLayoutEffect(() => {
    if (text === visible && phase === "idle") return;
    if (text === visible) return;
    pendingRef.current = text;

    if (prefersReducedMotion()) {
      cancelAnimations();
      setVisible(text);
      setPhase("idle");
      return;
    }

    if (phase === "idle") {
      setPhase("exiting");
    }
  }, [text, visible, phase]);

  useLayoutEffect(() => {
    if (phase !== "exiting") return;

    const units = unitsOf(rootRef.current);
    if (!units.length) {
      setVisible(pendingRef.current);
      setPhase("entering");
      return;
    }

    cancelAnimations();
    const { animations, duration } = animatePhase(
      units,
      BLUR_OUT_UP_SPEC.exit,
      speed,
      yTravel,
    );
    animationsRef.current = animations;

    const timer = window.setTimeout(() => {
      setVisible(pendingRef.current);
      setPhase("entering");
    }, duration + (BLUR_OUT_UP_SPEC.swap?.microDelayMs ?? 0));

    return () => {
      window.clearTimeout(timer);
      cancelAnimations();
    };
  }, [phase, speed, yTravel]);

  useLayoutEffect(() => {
    if (phase !== "entering") return;

    const units = unitsOf(rootRef.current);
    if (!units.length) {
      setPhase("idle");
      return;
    }

    cancelAnimations();
    const { animations, duration } = animatePhase(
      units,
      BLUR_OUT_UP_SPEC.enter,
      speed,
      yTravel,
    );
    animationsRef.current = animations;

    const timer = window.setTimeout(() => {
      setPhase("idle");
    }, duration);

    return () => {
      window.clearTimeout(timer);
      cancelAnimations();
    };
  }, [phase, visible, speed, yTravel]);

  const enterFrom = BLUR_OUT_UP_SPEC.enter.from;
  const enteringStyle =
    phase === "entering"
      ? {
          opacity: enterFrom.opacity ?? 0,
          filter: `blur(${enterFrom.blurPx ?? 0}px)`,
          transform: `translate3d(0, ${(enterFrom.yPx ?? 0) * yTravel}px, 0)`,
        }
      : undefined;

  return (
    <span
      ref={rootRef}
      className={cn("inline", className)}
      aria-label={text}
    >
      {splitTextByTarget(visible, BLUR_OUT_UP_SPEC.target).map((part, index) => (
        <span
          key={`${visible}-${index}`}
          data-anim-unit={part.animate ? "" : undefined}
          className="text-animation-unit"
          style={part.animate ? enteringStyle : undefined}
          aria-hidden="true"
        >
          {part.text}
        </span>
      ))}
    </span>
  );
}
