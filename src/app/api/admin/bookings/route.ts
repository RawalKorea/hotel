import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  if (month && year) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    where.OR = [
      { checkIn: { gte: startDate, lte: endDate } },
      { checkOut: { gte: startDate, lte: endDate } },
      { checkIn: { lte: startDate }, checkOut: { gte: endDate } },
    ];
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: { select: { name: true, email: true, phone: true } },
      room: { select: { name: true, grade: true } },
      payment: { select: { status: true, amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}
