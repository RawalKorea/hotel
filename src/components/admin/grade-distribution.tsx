"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";

const chartConfig = {
  standard: { label: "스탠다드", color: "var(--chart-1)" },
  superior: { label: "슈피리어", color: "var(--chart-2)" },
  deluxe: { label: "디럭스", color: "var(--chart-3)" },
  suite: { label: "스위트", color: "var(--chart-4)" },
  presidential: { label: "프레지덴셜", color: "var(--chart-5)" },
} satisfies ChartConfig;

const data = [
  { name: "스탠다드", value: 35, fill: "var(--color-standard)" },
  { name: "슈피리어", value: 25, fill: "var(--color-superior)" },
  { name: "디럭스", value: 20, fill: "var(--color-deluxe)" },
  { name: "스위트", value: 12, fill: "var(--color-suite)" },
  { name: "프레지덴셜", value: 8, fill: "var(--color-presidential)" },
];

export function GradeDistribution() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
          nameKey="name"
        />
      </PieChart>
    </ChartContainer>
  );
}
