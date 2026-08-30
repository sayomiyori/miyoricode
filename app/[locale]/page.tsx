import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/hero/Hero";

type Props = {
  params: { locale: string };
};

export default function HomePage({ params }: Props) {
  setRequestLocale(params.locale);
  return <Hero />;
}
