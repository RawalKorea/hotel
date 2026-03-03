"use client";

import { AuthSessionProvider } from "./session-provider";
import { ThemeApplier } from "./theme-applier";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthSessionProvider>
      <ThemeApplier />
      <TooltipProvider>
        {children}
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </AuthSessionProvider>
  );
}
