"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { EmptyState } from "@/components/shared/empty-state";
import { useLanguage } from "@/lib/i18n/context";
import { formatDateShort } from "@/lib/i18n/format";

const config: ChartConfig = { percent: { label: "Attendance %", color: "var(--chart-1)" } };

export function AttendanceTrendChart({ data }: { data: { date: string; percent: number }[] }) {
  const { locale } = useLanguage();

  if (data.length === 0) {
    return <EmptyState title={locale === "bn" ? "কোনো তথ্য নেই" : "No data for this range"} />;
  }

  const chartData = data.map((d) => ({ ...d, label: formatDateShort(d.date, locale) }));
  const summary = chartData.map((d) => `${d.label}: ${d.percent}%`).join(", ");

  return (
    <div>
      <ChartContainer config={config} className="aspect-auto h-56 w-full">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
          <YAxis tickLine={false} axisLine={false} width={36} domain={[0, 100]} />
          <ChartTooltip content={<ChartTooltipContent />} cursor={{ stroke: "var(--border)" }} />
          <Area type="monotone" dataKey="percent" stroke="var(--chart-1)" strokeWidth={2} fill="url(#attendanceFill)" />
        </AreaChart>
      </ChartContainer>
      <p className="sr-only">{locale === "bn" ? "দৈনিক উপস্থিতির হার: " : "Daily attendance rate: "}{summary}</p>
    </div>
  );
}
