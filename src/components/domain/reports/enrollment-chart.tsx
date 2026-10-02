"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LabelList, Cell } from "recharts";
import type { Department } from "@/types";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useLanguage, useBilingual } from "@/lib/i18n/context";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

export function EnrollmentChart({
  data,
}: {
  data: { department: Department; count: number }[];
}) {
  const { locale } = useLanguage();
  const bilingual = useBilingual();

  const chartData = data.map((d, i) => ({
    code: d.department.code,
    name: bilingual(d.department.name),
    count: d.count,
    fill: COLORS[i % COLORS.length],
  }));

  const config: ChartConfig = Object.fromEntries(
    data.map((d) => [d.department.code, { label: bilingual(d.department.name) }]),
  );

  const summary = chartData.map((d) => `${d.code}: ${d.count}`).join(", ");

  return (
    <div>
      <ChartContainer config={config} className="aspect-auto h-64 w-full">
        <BarChart data={chartData} margin={{ top: 16, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="code" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={56}>
            {chartData.map((d) => (
              <Cell key={d.code} fill={d.fill} />
            ))}
            <LabelList dataKey="count" position="top" className="fill-foreground text-xs" />
          </Bar>
        </BarChart>
      </ChartContainer>
      <p className="sr-only">
        {locale === "bn" ? "বিভাগভিত্তিক সক্রিয় শিক্ষার্থী সংখ্যা: " : "Active students by department: "}
        {summary}
      </p>
    </div>
  );
}
