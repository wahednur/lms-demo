import { cn } from "@/lib/utils";

/**
 * Placeholder institutional mark — no real logo was supplied, so this is a
 * deliberately simple geometric seal (not an invented coat-of-arms or
 * official emblem) standing in for one, per brief §5.
 */
export function InstituteMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground ring-2 ring-primary/15",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
      aria-hidden="true"
    >
      SG
    </div>
  );
}
