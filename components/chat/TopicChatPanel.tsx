"use client";

import { ChatBubble } from "@/components/chat/ChatBubble";
import { ChatEnter } from "@/components/chat/ChatEnter";
import { AskInput } from "@/components/hero/AskInput";
import { useLocaleSwitch } from "@/components/layout/LocaleSwitchProvider";
import { useTopicChatContext } from "@/components/chat/topic-chat-context";
import { cn } from "@/lib/utils";

export function TopicChatPanel() {
  const { messages } = useLocaleSwitch();
  const { turns, pending, send } = useTopicChatContext();

  if (turns.length === 0 && !pending) return null;

  return (
    <div className="flex w-full min-w-0 flex-col items-stretch">
      <div
        className="mb-4 -mx-2 flex min-w-0 flex-col gap-3 overflow-x-hidden px-2 py-1.5"
        aria-live="polite"
      >
        {turns.map((turn) =>
          turn.role === "user" ? (
            <ChatEnter
              key={turn.id}
              restored={turn.isRestored}
              className="flex justify-end"
            >
              <p
                className={cn(
                  "glass max-w-[85%] px-3.5 py-2 text-left text-sm shadow-lg",
                  "bg-white/10 border border-white/20 wdth-normal text-ink",
                )}
              >
                {turn.text}
              </p>
            </ChatEnter>
          ) : (
            <ChatEnter key={turn.id} restored={turn.isRestored}>
              <ChatBubble
                text={turn.text}
                attachments={turn.attachments}
                card={turn.card}
                openDemoLabel={messages.openDemo}
                closePreviewLabel={messages.closePreview}
                previewTitle={messages.previewTitle}
                closeProjectLabel={messages.closeProject}
                projectLinksLabel={messages.projectLinks}
                projectScreenshotsLabel={messages.projectScreenshots}
                thinkingLabel={messages.thinking}
              />
            </ChatEnter>
          ),
        )}
      </div>
      <AskInput onAsk={send} disabled={pending} />
    </div>
  );
}
