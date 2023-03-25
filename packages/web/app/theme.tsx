import { Inter, Inconsolata } from "next/font/google";

export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const fontMono = Inconsolata({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-mono",
});
