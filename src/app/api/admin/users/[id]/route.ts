import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      _count: { select: { bookings: true, reviews: true, inquiries: true } },
      bookings: {
        take: 10,
        orderBy: { checkIn: "desc" },
        include: { room: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  const { password, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { role } = body as { role?: string };

    if (!["USER", "STAFF", "SUPER_ADMIN"].includes(role || "")) {
      return NextResponse.json(
        { error: "올바른 역할이 아닙니다." },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: role as "USER" | "STAFF" | "SUPER_ADMIN" },
    });

    const { password, ...safe } = user;
    return NextResponse.json(safe);
  } catch {
    return NextResponse.json(
      { error: "수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
