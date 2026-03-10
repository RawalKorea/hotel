import { prisma } from "@/lib/prisma";

const MONTH_LABELS = [
  "1월", "2월", "3월", "4월", "5월", "6월",
  "7월", "8월", "9월", "10월", "11월", "12월",
];

const gradeToLabel: Record<string, string> = {
  STANDARD: "스탠다드",
  SUPERIOR: "슈피리어",
  DELUXE: "디럭스",
  SUITE: "스위트",
  PRESIDENTIAL: "프레지덴셜",
};
const gradeToVar: Record<string, string> = {
  STANDARD: "var(--color-standard)",
  SUPERIOR: "var(--color-superior)",
  DELUXE: "var(--color-deluxe)",
  SUITE: "var(--color-suite)",
  PRESIDENTIAL: "var(--color-presidential)",
};

export async function getChartData() {
  try {
    const now = new Date();
    const year = now.getFullYear();

    const [payments, bookingsWithRoom, roomCount] = await Promise.all([
      prisma.payment.findMany({
        where: { status: "PAID", paidAt: { not: null } },
        select: { amount: true, paidAt: true },
      }),
      prisma.booking.findMany({
        where: { status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] } },
        select: { checkIn: true, checkOut: true, room: { select: { grade: true } } },
      }),
      prisma.room.count({ where: { status: "AVAILABLE" } }),
    ]);

    const monthlyRevenue = MONTH_LABELS.map((label, i) => {
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 0, 23, 59, 59);
      const amount = payments
        .filter((p) => p.paidAt && p.paidAt >= monthStart && p.paidAt <= monthEnd)
        .reduce((sum, p) => sum + p.amount, 0);
      return { month: label, revenue: Math.round(amount / 10000) };
    });

    const monthlyOccupancy = MONTH_LABELS.map((label, i) => {
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 0);
      const daysInMonth = monthEnd.getDate();
      const availableNights = roomCount * daysInMonth;
      if (availableNights === 0) return { month: label, occupancy: 0 };

      let bookedNights = 0;
      for (const b of bookingsWithRoom) {
        const overlapStart = b.checkIn > monthStart ? b.checkIn : monthStart;
        const overlapEnd = b.checkOut < monthEnd ? b.checkOut : monthEnd;
        if (overlapStart <= overlapEnd) {
          const nights = Math.ceil(
            (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)
          );
          bookedNights += Math.max(0, nights);
        }
      }
      const occupancy = Math.min(
        100,
        Math.round((bookedNights / availableNights) * 100)
      );
      return { month: label, occupancy };
    });

    const gradeCounts: Record<string, number> = {};
    for (const b of bookingsWithRoom) {
      gradeCounts[b.room.grade] = (gradeCounts[b.room.grade] ?? 0) + 1;
    }
    const gradeDistribution = Object.entries(gradeCounts)
      .filter(([, v]) => v > 0)
      .map(([grade, value]) => ({
        name: gradeToLabel[grade] || grade,
        value,
        fill: gradeToVar[grade] || "var(--chart-1)",
      }));

    return {
      monthlyRevenue,
      monthlyOccupancy,
      gradeDistribution,
    };
  } catch {
    return {
      monthlyRevenue: [] as { month: string; revenue: number }[],
      monthlyOccupancy: [] as { month: string; occupancy: number }[],
      gradeDistribution: [] as { name: string; value: number; fill: string }[],
    };
  }
}
