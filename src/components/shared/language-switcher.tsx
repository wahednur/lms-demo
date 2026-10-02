"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, toggleLocale } = useLanguage();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleLocale}
      className={cn("gap-1.5", className)}
      aria-label={locale === "bn" ? "Switch to English" : "বাংলায় পরিবর্তন করুন"}
    >
      <Languages className="size-4" aria-hidden="true" />
      <span>{locale === "bn" ? "EN" : "বাং"}</span>
    </Button>
  );
}
