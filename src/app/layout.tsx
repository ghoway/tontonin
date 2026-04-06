import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ErrorProvider } from "@/components/ErrorModal";
import { TopNavigation } from "@/components/TopNavigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Nontonin",
  description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Platform streaming drama, film, dan anime gratis tanpa login",
  keywords: process.env.NEXT_PUBLIC_APP_KEYWORDS?.split(", ") || ["drama", "streaming", "nonton", "tonton"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-black text-white">
        <ErrorProvider>
          <TopNavigation />
          <main className="flex-1">{children}</main>
        </ErrorProvider>
        <Analytics />
      </body>
    </html>
  );
}
