"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/context";

export function PrintButton({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <Button variant="outline" size="sm" className={`no-print gap-1.5 ${className ?? ""}`} onClick={() => window.print()}>
      <Printer className="size-4" />
      {t("action.print")}
    </Button>
  );
}
