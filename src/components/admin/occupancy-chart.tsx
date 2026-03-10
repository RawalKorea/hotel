"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis } from "recharts";

const chartConfig = {
  occupancy: {
    label: "가동률 (%)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

type DataItem = { month: string; occupancy: number };

export function OccupancyChart({ data }: { data: DataItem[] }) {
  const hasData = data.some((d) => d.occupancy > 0);

  if (!hasData) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        데이터가 없습니다.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={data}>
        <XAxis
          dataKey="month"
          tickLine={false}
          axisLine={false}
          fontSize={12}
        />
        <YAxis tickLine={false} axisLine={false} fontSize={12} unit="%" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar
          dataKey="occupancy"
          fill="var(--color-occupancy)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
