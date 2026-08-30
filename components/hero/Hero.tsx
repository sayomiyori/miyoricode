import { AvatarTilt } from "./AvatarTilt";
import { ChatProvider } from "@/components/chat/chat-context";
import { ChatPanel } from "@/components/chat/ChatPanel";
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
      <main className="relative z-10 flex min-h-dvh items-center justify-center overflow-x-hidden px-5 py-16">
        <div className="flex w-full min-w-0 max-w-[600px] flex-col items-center text-center">
          <Logo />
          <HeroCopy />
          <div className="mt-8 w-full">
            <AvatarTilt />
          </div>
          <ChatProvider>
            <div className="mt-8 w-full">
              <ChatPanel />
            </div>
            <ShortcutRow />
          </ChatProvider>
        </div>
      </main>
    </LocaleSwitchProvider>
  );
}
