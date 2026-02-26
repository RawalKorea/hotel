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

const mockData = [
  { month: "1월", revenue: 1200 },
  { month: "2월", revenue: 1500 },
  { month: "3월", revenue: 980 },
  { month: "4월", revenue: 1800 },
  { month: "5월", revenue: 2200 },
  { month: "6월", revenue: 2600 },
  { month: "7월", revenue: 3200 },
  { month: "8월", revenue: 3000 },
  { month: "9월", revenue: 2100 },
  { month: "10월", revenue: 1700 },
  { month: "11월", revenue: 1400 },
  { month: "12월", revenue: 2800 },
];

export function RevenueChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart data={mockData}>
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
