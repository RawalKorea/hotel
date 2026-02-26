import { AdminHeader } from "@/components/admin/admin-header";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { GradeDistribution } from "@/components/admin/grade-distribution";

export const dynamic = "force-dynamic";

async function getAnalyticsData() {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [currentMonthRevenue, lastMonthRevenue, totalRevenue, bookingsByGrade] =
      await Promise.all([
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: { status: "PAID", paidAt: { gte: monthStart } },
        }),
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            status: "PAID",
            paidAt: { gte: lastMonthStart, lte: lastMonthEnd },
          },
        }),
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: { status: "PAID" },
        }),
        prisma.booking.groupBy({
          by: ["roomId"],
          _count: true,
          where: { status: { in: ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"] } },
        }),
      ]);

    const current = currentMonthRevenue._sum.amount || 0;
    const last = lastMonthRevenue._sum.amount || 0;
    const growth = last > 0 ? Math.round(((current - last) / last) * 100) : 0;

    return {
      currentMonthRevenue: current,
      lastMonthRevenue: last,
      totalRevenue: totalRevenue._sum.amount || 0,
      growth,
      totalBookings: bookingsByGrade.reduce((sum, b) => sum + b._count, 0),
    };
  } catch {
    return {
      currentMonthRevenue: 0,
      lastMonthRevenue: 0,
      totalRevenue: 0,
      growth: 0,
      totalBookings: 0,
    };
  }
}

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsData();

  return (
    <>
      <AdminHeader title="매출/통계" />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                이번 달 매출
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ₩{formatPrice(data.currentMonthRevenue)}
              </p>
              <p
                className={`text-sm ${data.growth >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {data.growth >= 0 ? "+" : ""}
                {data.growth}% 전월 대비
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                지난 달 매출
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ₩{formatPrice(data.lastMonthRevenue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                누적 매출
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                ₩{formatPrice(data.totalRevenue)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                완료된 예약
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{data.totalBookings}건</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>월별 매출 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>객실 등급별 예약 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <GradeDistribution />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
