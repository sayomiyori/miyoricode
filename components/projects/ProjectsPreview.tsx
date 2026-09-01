"use client";

import { ProjectsShowcase } from "./ProjectsShowcase";
import type { ChatCard } from "@/lib/chat";

const MOCK_CARD: ChatCard = {
  type: "project_carousel",
  items: [
    {
      id: "1",
      title: "Velox",
      category: "AI Product",
      year: "2026",
      cover_image: null,
      cover_gradient: ["#3b82f6", "#06b6d4"],
      description: "AI-platform for runners with RAG coach.",
      technologies: ["FastAPI", "React", "Qdrant"],
      link: null,
      links: [],
      screenshots: [],
    },
    {
      id: "2",
      title: "SaaSAiMenu",
      category: "SaaS Platform",
      year: "2026",
      cover_image: null,
      cover_gradient: ["#8b5cf6", "#ec4899"],
      description: "Multilingual QR menu for restaurants with AI agent.",
      technologies: ["FastAPI", "Next.js", "PostgreSQL"],
      link: null,
      links: [],
      screenshots: [],
    },
    {
      id: "3",
      title: "Fazer",
      category: "Digital Goods",
      year: "2025",
      cover_image: null,
      cover_gradient: ["#f97316", "#facc15"],
      description: "Digital goods marketplace with automated delivery.",
      technologies: ["Python", "Telegram API"],
      link: null,
      links: [],
      screenshots: [],
    },
  ],
};

type ProjectsPreviewProps = {
  closeLabel: string;
  demoLabel: string;
  linksLabel: string;
  screenshotsLabel: string;
};

export function ProjectsPreview(props: ProjectsPreviewProps) {
  return <ProjectsShowcase card={MOCK_CARD} {...props} />;
}
