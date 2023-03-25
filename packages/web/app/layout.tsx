import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { fontSans, fontMono } from "./theme";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "flok",
  description:
    "Web-based P2P collaborative editor for live coding sounds and images",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={cn(
          "min-h-screen font-sans bg-slate-100 text-slate-900 antialiased dark:bg-slate-900 dark:text-slate-50",
          fontSans.variable,
          fontMono.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
