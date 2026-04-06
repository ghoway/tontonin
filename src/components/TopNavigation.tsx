"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";

export function TopNavigation() {
  const pathname = usePathname();

  // Hide top navigation in media player experiences.
  if (pathname?.startsWith("/mediaplayer") || pathname?.includes("/watch")) {
    return null;
  }

  return <Header />;
}
