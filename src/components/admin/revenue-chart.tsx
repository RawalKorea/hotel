"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  revenue: {
    label: "매출 (만원)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type DataItem = { month: string; revenue: number };

export function RevenueChart({ data }: { data: DataItem[] }) {
  const hasData = data.some((d) => d.revenue > 0);

  if (!hasData) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        데이터가 없습니다.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-revenue)"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="var(--color-revenue)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis tickLine={false} axisLine={false} fontSize={12} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-revenue)"
          fill="url(#colorRevenue)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  );
}
