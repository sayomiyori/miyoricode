"use client";

import { ChatBubble } from "@/components/chat/ChatBubble";
import { useChatContext } from "@/components/chat/chat-context";
import { AskInput } from "@/components/hero/AskInput";
import { useLocaleSwitch } from "@/components/layout/LocaleSwitchProvider";
import { cn } from "@/lib/utils";

export function ChatPanel() {
  const { messages } = useLocaleSwitch();
  const { turns, pending, send } = useChatContext();

  return (
    <div className="flex w-full min-w-0 flex-col items-stretch">
      {turns.length > 0 || pending ? (
        <div
          className="mb-4 flex min-w-0 flex-col gap-3 overflow-x-hidden"
          aria-live="polite"
        >
          {turns.map((turn) =>
            turn.role === "user" ? (
              <p
                key={turn.id}
                className={cn(
                  "glass ml-auto max-w-[85%] px-3.5 py-2 text-left text-sm",
                  "bg-white/10 backdrop-blur-md backdrop-saturate-150",
                  "border border-white/20 shadow-lg wdth-normal text-ink",
                )}
              >
                {turn.text}
              </p>
            ) : (
              <ChatBubble
                key={turn.id}
                text={turn.text}
                attachments={turn.attachments}
                openDemoLabel={messages.openDemo}
                closePreviewLabel={messages.closePreview}
                previewTitle={messages.previewTitle}
              />
            ),
          )}
          {pending ? (
            <div
              className={cn(
                "glass w-fit px-4 py-3 text-left text-sm text-ink/70",
                "bg-white/10 backdrop-blur-md backdrop-saturate-150",
                "border border-white/20 shadow-lg",
              )}
              aria-busy="true"
            >
              <span className="motion-safe:animate-pulse">{messages.thinking}</span>
            </div>
          ) : null}
        </div>
      ) : null}
      <AskInput onAsk={send} disabled={pending} />
    </div>
  );
}
