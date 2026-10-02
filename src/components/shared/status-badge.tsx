"use client";

import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/dictionary";

export type KnownStatus =
  | "active"
  | "inactive"
  | "promoted"
  | "alumni"
  | "dropped"
  | "draft"
  | "submitted"
  | "verified"
  | "published"
  | "returned"
  | "present"
  | "absent"
  | "not-recorded"
  | "missing";

type Variant = "success" | "warning" | "danger" | "info" | "neutral";

const VARIANT_CLASS: Record<Variant, string> = {
  success: "bg-success-soft text-success border-success/30",
  warning: "bg-warning-soft text-warning border-warning/40",
  danger: "bg-danger-soft text-danger border-danger/30",
  info: "bg-info-soft text-info border-info/30",
  neutral: "bg-muted text-muted-foreground border-border",
};

const STATUS_CONFIG: Record<KnownStatus, { variant: Variant; labelKey: TranslationKey }> = {
  active: { variant: "success", labelKey: "status.active" },
  inactive: { variant: "neutral", labelKey: "status.inactive" },
  promoted: { variant: "info", labelKey: "status.promoted" },
  alumni: { variant: "neutral", labelKey: "status.alumni" },
  dropped: { variant: "danger", labelKey: "status.dropped" },
  draft: { variant: "neutral", labelKey: "status.draft" },
  submitted: { variant: "warning", labelKey: "status.submitted" },
  verified: { variant: "info", labelKey: "status.verified" },
  published: { variant: "success", labelKey: "status.published" },
  returned: { variant: "danger", labelKey: "status.returned" },
  present: { variant: "success", labelKey: "status.present" },
  absent: { variant: "danger", labelKey: "status.absent" },
  "not-recorded": { variant: "neutral", labelKey: "status.notRecorded" },
  missing: { variant: "warning", labelKey: "status.missing" },
};

export function StatusBadge({ status, className }: { status: KnownStatus; className?: string }) {
  const { t } = useLanguage();
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        VARIANT_CLASS[config.variant],
        className,
      )}
    >
      {t(config.labelKey)}
    </span>
  );
}
