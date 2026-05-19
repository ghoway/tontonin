"use client";

import { QueryClient, QueryClientProvider, QueryCache } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
            onError: (error: any) => {
                if (error?.response?.status === 429 || error?.status === 429) {
                    toast.error("Terlalu Cepat!", {
                        description: "Mohon tunggu sebentar sebelum request lagi.",
                        duration: 5000,
                    });
                }
            },
        }),
        defaultOptions: {
          queries: {
            // staleTime: 60 * 1000, // sebelumnya cuma ini sendiri
            staleTime: 5 * 60 * 1000, // Increased to 5 mins
            refetchOnWindowFocus: false, // Disable auto refresh on focus
            refetchOnMount: false, // Disable auto refresh on mount
            refetchOnReconnect: false, // Disable auto refresh on network reconnect
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <TooltipProvider>{children}</TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
