// design-system/fonts.ts
// Source of truth for portfolio fonts.
// Consumed by the hub and any project that runs brand:sync.
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";

export const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const fontSerif = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500"],
  axes: ["opsz"],
  display: "swap",
});

export const fontMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const fontVariables = [
  fontSans.variable,
  fontSerif.variable,
  fontMono.variable,
].join(" ");
