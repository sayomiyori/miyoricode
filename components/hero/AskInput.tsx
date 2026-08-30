"use client";

import { FormEvent, useState } from "react";
import { ArrowUp } from "lucide-react";
import BlurOutUp from "@/components/animata/text/blur-out-up";
import { useLocaleSwitch } from "@/components/layout/LocaleSwitchProvider";
import { cn } from "@/lib/utils";

export function AskInput() {
  const { messages } = useLocaleSwitch();
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: backend
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "glass group flex w-full items-center gap-2 px-3 py-2",
        "bg-white/10 backdrop-blur-md backdrop-saturate-150",
        "border border-white/20 shadow-lg",
        "transition-colors duration-200",
        "focus-within:border-blue-400/40",
      )}
    >
      <label className="sr-only" htmlFor="ask-input">
        {messages.askAria}
      </label>
      <div className="relative min-w-0 flex-1">
        <input
          id="ask-input"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={messages.placeholder}
          autoComplete="off"
          className={cn(
            "w-full bg-transparent px-2 py-2 text-base font-normal wdth-normal text-ink focus:outline-none",
            !value && "caret-ink placeholder:text-transparent",
          )}
        />
        {!value ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-base font-normal wdth-normal text-ink/45"
          >
            <BlurOutUp text={messages.placeholder} />
          </span>
        ) : null}
      </div>
      <button
        type="submit"
        aria-label={messages.sendAria}
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          "bg-splat-blue text-white shadow-md",
          "transition-colors duration-200 hover:bg-[#3b5de0]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/80 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        )}
      >
        <ArrowUp className="h-5 w-5" aria-hidden="true" strokeWidth={2.25} />
      </button>
    </form>
  );
}
