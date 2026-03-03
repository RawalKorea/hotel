import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role");

  const where: { OR?: unknown[]; role?: string } = {};
  if (search.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: "insensitive" } },
      { email: { contains: search.trim(), mode: "insensitive" } },
      { username: { contains: search.trim(), mode: "insensitive" } },
      { phone: { contains: search.trim(), mode: "insensitive" } },
    ];
  }
  if (role && ["USER", "STAFF", "SUPER_ADMIN"].includes(role)) {
    where.role = role as "USER" | "STAFF" | "SUPER_ADMIN";
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: {
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  // password 제외
  const safeUsers = users.map((u) => {
    const { password: _p, ...rest } = u;
    return { ...rest, _count: (u as { _count?: { bookings: number; reviews: number } })._count };
  });

  return NextResponse.json({
    users: safeUsers,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
