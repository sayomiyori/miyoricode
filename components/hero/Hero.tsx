import { AskInput } from "./AskInput";
import { AvatarTilt } from "./AvatarTilt";
import FluidCursor from "./FluidCursor";
import { HeroCopy } from "./HeroCopy";
import { Logo } from "./Logo";
import { ShortcutRow } from "./ShortcutRow";
import { Watermark } from "./Watermark";
import { LangToggle } from "@/components/layout/LangToggle";
import { LocaleSwitchProvider } from "@/components/layout/LocaleSwitchProvider";

export function Hero() {
  return (
    <LocaleSwitchProvider>
      <Watermark />
      <FluidCursor />
      <LangToggle />
      <main className="relative z-10 flex min-h-dvh items-center justify-center px-5 py-16">
        <div className="flex w-full max-w-[600px] flex-col items-center text-center">
          <Logo />
          <HeroCopy />
          <div className="mt-8 w-full">
            <AvatarTilt />
          </div>
          <div className="mt-8 w-full">
            <AskInput />
          </div>
          <ShortcutRow />
        </div>
      </main>
    </LocaleSwitchProvider>
  );
}
