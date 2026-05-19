"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  // Hide footer on watch pages for immersive video experience
  if (pathname?.startsWith("/watch")) {
    return null;
  }

  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-3">
          {/* API Promo */}
          {/* <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://lynk.id/sansekai/6gdx3w875wx1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                >
                  Beli Source Code Website Ini
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
          </ul> */}

          <p className="text-sm text-muted-foreground text-center">
            API yang digunakan:{" "}
            <a 
                  href="https://api.sansekai.my.id" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 text-primary hover:underline font-semibold"
                >
                  SΛNSΞKΛI API
                  <ExternalLink className="w-3 h-3" />
                </a>
          </p>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground/80 text-center font-medium">
            © {new Date().getFullYear()} Made with ❤️ by Yusril
          </p>
        </div>
      </div>
    </footer>
  );
}
