"use client";

import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n/context";
import type { TranslationKey } from "@/lib/i18n/dictionary";

/**
 * Hand-rolled replacement for shadcn's classic `<Form>` wrapper — this
 * project's shadcn registry (style `radix-nova`) doesn't ship a `form.tsx`
 * primitive (see PROGRESS.md). Pairs with react-hook-form's `register`/
 * `Controller` directly. Zod schemas in `lib/validation/*` deliberately set
 * `message` to a `TranslationKey` (e.g. "form.required") so errors render
 * in the active language automatically.
 */
export function FormField({
  label,
  htmlFor,
  error,
  optional,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: { message?: string };
  optional?: boolean;
  children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <div>
      <Label htmlFor={htmlFor} className="mb-1.5">
        {label}
        {optional && <span className="ml-1 font-normal text-muted-foreground">({t("common.optional")})</span>}
      </Label>
      {children}
      {error?.message && (
        <p className="mt-1 text-xs text-danger">{t(error.message as TranslationKey)}</p>
      )}
    </div>
  );
}
