import { setRequestLocale } from "next-intl/server";
import { LocaleSwitchProvider } from "@/components/layout/LocaleSwitchProvider";
import { Watermark } from "@/components/hero/Watermark";
import { LangToggle } from "@/components/layout/LangToggle";
import { ProjectsShowcase } from "@/components/projects/ProjectsShowcase";
import type { ChatCard } from "@/lib/chat";

const MOCK_CARD: ChatCard = {
  type: "project_carousel",
  items: [
    {
      id: "velox",
      title: "Velox",
      category: "AI Product",
      year: "2026",
      tagline: null,
      cover_image: "/projects/velox-mascot.png",
      cover_gradient: ["#0c4a6e", "#0e7490"],
      description:
        "AI-platform for runners with RAG coach. FastAPI, React, Qdrant.",
      technologies: ["FastAPI", "React", "Qdrant"],
      link: null,
      links: [],
      screenshots: [],
    },
    {
      id: "maitre",
      title: "SaaSAiMenu (Maitre)",
      category: "SaaS Platform",
      year: "2026",
      tagline: null,
      cover_image: "/projects/maitre-mascot.png",
      cover_gradient: ["#8b5cf6", "#ec4899"],
      description:
        "Multilingual QR menu for restaurants with AI agent. FastAPI, Next.js, PostgreSQL.",
      technologies: ["FastAPI", "Next.js", "PostgreSQL"],
      link: null,
      links: [],
      screenshots: [],
    },
    {
      id: "ai-chaina",
      title: "AI-CHAINA",
      category: "Automation",
      year: "2026",
      tagline: null,
      cover_image: "/projects/ai-chaina-mascot.png",
      cover_gradient: ["#f97316", "#facc15"],
      description:
        "Document automation for China importers — full pipeline automation.",
      technologies: ["Python", "Telegram API", "OCR"],
      link: null,
      links: [],
      screenshots: [],
    },
  ],
};

type Props = {
  params: { locale: string };
};

export default function TestCardsPage({ params }: Props) {
  setRequestLocale(params.locale);

  return (
    <LocaleSwitchProvider>
      <Watermark />
      <LangToggle />
      <main className="relative z-10 mx-auto max-w-[56rem] px-5 py-16">
        <ProjectsShowcase
          card={MOCK_CARD}
          closeLabel="Close"
          demoLabel="Open demo"
          linksLabel="Links"
          screenshotsLabel="Screenshots"
          viewDetailsLabel="View details"
        />
      </main>
    </LocaleSwitchProvider>
  );
}
