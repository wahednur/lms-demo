"use client";

import { FlaskConical } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLanguage } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

/** Small, unobtrusive "this is a demo" marker — never dominates the UI, but
 * is always present somewhere in the chrome (brief §7/§14). */
export function DemoIndicator({ className }: { className?: string }) {
  const { t } = useLanguage();
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning-soft px-2 py-0.5 text-[11px] font-medium text-warning",
            className,
          )}
        >
          <FlaskConical className="size-3" aria-hidden="true" />
          DEMO
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-64">{t("demo.banner")}</TooltipContent>
    </Tooltip>
  );
}
