"use client";

import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { isSafeHttpUrl } from "@/lib/chat";
import { cn } from "@/lib/utils";

function urlTransform(url: string): string {
  return isSafeHttpUrl(url) ? url : "";
}

const markdownComponents: Components = {
  a({ href, children, node: _node, ...props }) {
    const safeHref = href && isSafeHttpUrl(href) ? href : undefined;
    if (!safeHref) {
      return <span>{children}</span>;
    }

    return (
      <a
        {...props}
        href={safeHref}
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer break-words text-splat-blue underline-offset-2 transition-colors duration-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-splat-blue/70"
      >
        {children}
      </a>
    );
  },
};

type BotMarkdownProps = {
  text: string;
};

export function BotMarkdown({ text }: BotMarkdownProps) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none wdth-normal text-ink",
        "prose-headings:mb-2 prose-headings:mt-3 prose-headings:font-display prose-headings:font-semibold prose-headings:text-ink prose-headings:tracking-tight",
        "prose-h1:text-xl prose-h2:text-lg prose-h3:text-base",
        "prose-p:text-ink prose-li:text-ink prose-strong:text-ink",
        "prose-a:font-medium prose-a:text-splat-blue prose-a:no-underline",
        "prose-code:rounded prose-code:bg-white/50 prose-code:px-1 prose-code:py-0.5 prose-code:text-ink prose-code:before:content-none prose-code:after:content-none",
        "text-sm font-normal leading-relaxed md:text-[0.95rem]",
        "[&>:first-child]:mt-0 [&>:last-child]:mb-0",
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        urlTransform={urlTransform}
        components={markdownComponents}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
