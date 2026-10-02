"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { EmptyState } from "@/components/shared/empty-state";
import { useLanguage } from "@/lib/i18n/context";

// Grades are ordinal (quality), so color follows the existing status scale
// (success→warning→danger) rather than an arbitrary categorical palette —
// the "status colors" path, not a fresh categorical one.
const GRADE_COLOR: Record<string, string> = {
  "A+": "var(--success)",
  A: "var(--success)",
  "A-": "var(--success)",
  B: "var(--warning)",
  C: "var(--warning)",
  D: "var(--danger)",
  F: "var(--danger)",
};

export function GradeDistributionChart({ data }: { data: { grade: string; count: number }[] }) {
  const { locale } = useLanguage();

  if (data.length === 0) {
    return <EmptyState title={locale === "bn" ? "কোনো প্রকাশিত ফলাফল নেই" : "No published results yet"} />;
  }

  const config: ChartConfig = Object.fromEntries(data.map((d) => [d.grade, { label: d.grade }]));
  const summary = data.map((d) => `${d.grade}: ${d.count}`).join(", ");

  return (
    <div>
      <ChartContainer config={config} className="aspect-auto h-64 w-full">
        <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="grade" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
            {data.map((d) => (
              <Cell key={d.grade} fill={GRADE_COLOR[d.grade] ?? "var(--chart-1)"} />
            ))}
            <LabelList dataKey="count" position="top" className="fill-foreground text-xs" />
          </Bar>
        </BarChart>
      </ChartContainer>
      <p className="sr-only">
        {locale === "bn" ? "গ্রেড বিতরণ: " : "Grade distribution: "}
        {summary}
      </p>
    </div>
  );
}
