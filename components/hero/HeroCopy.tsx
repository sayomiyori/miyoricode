"use client";

import BlurOutUp from "@/components/animata/text/blur-out-up";
import { useLocaleSwitch } from "@/components/layout/LocaleSwitchProvider";

export function HeroCopy() {
  const { messages } = useLocaleSwitch();

  return (
    <>
      <p className="font-display wdth-normal text-xl font-medium text-ink/80 sm:text-2xl">
        <BlurOutUp text={messages.greeting} />{" "}
        <span aria-hidden="true" className="inline-block origin-[70%_70%]">
          👋
        </span>
      </p>
      <h1 className="mt-2 font-display wdth-condensed text-4xl font-bold leading-[1.05] text-ink sm:text-5xl">
        <BlurOutUp text={messages.role} />
      </h1>
    </>
  );
}
