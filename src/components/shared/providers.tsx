"use client";

import type { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "@/lib/i18n/context";
import { SessionProvider } from "@/components/shared/session-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { DemoHelper } from "@/components/shared/demo-helper";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <LanguageProvider>
        <SessionProvider>
          <TooltipProvider>
            {children}
            <DemoHelper />
            <Toaster position="top-center" richColors closeButton />
          </TooltipProvider>
        </SessionProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
