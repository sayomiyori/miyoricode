import localFont from "next/font/local";
import { Manrope } from "next/font/google";

export const neueMontreal = localFont({
  src: [
    {
      path: "./fonts/PPNeueMontreal-Book.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/PPNeueMontreal-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/PPNeueMontreal-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/PPNeueMontreal-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/PPNeueMontreal-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-montreal",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const cyrillicFallback = Manrope({
  subsets: ["cyrillic"],
  variable: "--font-cyrillic",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
