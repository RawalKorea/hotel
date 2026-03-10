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

type DataItem = { name: string; value: number; fill?: string };

export function GradeDistribution({ data }: { data: DataItem[] }) {
  const hasData = data.length > 0 && data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
        데이터가 없습니다.
      </div>
    );
  }

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
