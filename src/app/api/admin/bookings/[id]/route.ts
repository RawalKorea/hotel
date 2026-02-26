import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { status } = await req.json();
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "CHECKED_IN",
      "CHECKED_OUT",
      "CANCELLED",
    ];

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "유효하지 않은 상태값입니다." },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        user: { select: { name: true, email: true } },
        room: { select: { name: true } },
      },
    });

    return NextResponse.json(booking);
  } catch {
    return NextResponse.json(
      { error: "예약 상태 변경 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
