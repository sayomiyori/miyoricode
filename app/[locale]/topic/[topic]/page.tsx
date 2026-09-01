import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { TopicPage } from "@/components/topic/TopicPage";
import { routing } from "@/i18n/routing";
import { SHORTCUT_KEYS } from "@/lib/shortcut-prompts";

type Props = {
  params: { locale: string; topic: string };
};

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    SHORTCUT_KEYS.map((topic) => ({ locale, topic })),
  );
}

export default function TopicRoute({ params }: Props) {
  setRequestLocale(params.locale);

  if (!SHORTCUT_KEYS.includes(params.topic as (typeof SHORTCUT_KEYS)[number])) {
    notFound();
  }

  return <TopicPage topic={params.topic} />;
}
