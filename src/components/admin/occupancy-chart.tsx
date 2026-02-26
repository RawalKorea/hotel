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

const mockData = [
  { month: "1월", occupancy: 65 },
  { month: "2월", occupancy: 72 },
  { month: "3월", occupancy: 58 },
  { month: "4월", occupancy: 80 },
  { month: "5월", occupancy: 85 },
  { month: "6월", occupancy: 90 },
  { month: "7월", occupancy: 95 },
  { month: "8월", occupancy: 92 },
  { month: "9월", occupancy: 78 },
  { month: "10월", occupancy: 70 },
  { month: "11월", occupancy: 62 },
  { month: "12월", occupancy: 88 },
];

export function OccupancyChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart data={mockData}>
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
