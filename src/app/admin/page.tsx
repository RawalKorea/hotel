import { AdminHeader } from "@/components/admin/admin-header";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BedDouble,
  CalendarCheck,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
} from "lucide-react";
import { RecentBookings } from "@/components/admin/recent-bookings";
import { OccupancyChart } from "@/components/admin/occupancy-chart";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  try {
    const [totalRooms, totalBookings, todayBookings, totalUsers] =
      await Promise.all([
        prisma.room.count(),
        prisma.booking.count(),
        prisma.booking.count({
          where: {
            checkIn: {
              lte: new Date(),
            },
            checkOut: {
              gte: new Date(),
            },
            status: { in: ["CONFIRMED", "CHECKED_IN"] },
          },
        }),
        prisma.user.count({ where: { role: "USER" } }),
      ]);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthlyRevenue = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "PAID",
        paidAt: { gte: monthStart },
      },
    });

    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true, username: true } },
        room: { select: { name: true, grade: true } },
      },
    });

    return {
      totalRooms,
      totalBookings,
      todayBookings,
      totalUsers,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      recentBookings,
    };
  } catch {
    return {
      totalRooms: 0,
      totalBookings: 0,
      todayBookings: 0,
      totalUsers: 0,
      monthlyRevenue: 0,
      recentBookings: [],
    };
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  const occupancyRate =
    data.totalRooms > 0
      ? Math.round((data.todayBookings / data.totalRooms) * 100)
      : 0;

  const stats = [
    {
      title: "전체 객실",
      value: `${data.totalRooms}개`,
      icon: BedDouble,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "이번 달 매출",
      value: `₩${formatPrice(data.monthlyRevenue)}`,
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      title: "오늘 투숙",
      value: `${data.todayBookings}건`,
      icon: CalendarCheck,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      title: "가동률",
      value: `${occupancyRate}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      title: "총 예약",
      value: `${data.totalBookings}건`,
      icon: Clock,
      color: "text-cyan-600",
      bg: "bg-cyan-50",
    },
    {
      title: "회원 수",
      value: `${data.totalUsers}명`,
      icon: Users,
      color: "text-pink-600",
      bg: "bg-pink-50",
    },
  ];

  return (
    <>
      <AdminHeader title="대시보드" />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="flex items-center gap-4 p-6">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}
                >
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>객실 가동률 추이</CardTitle>
            </CardHeader>
            <CardContent>
              <OccupancyChart />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>최근 예약</CardTitle>
            </CardHeader>
            <CardContent>
              <RecentBookings bookings={data.recentBookings} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
