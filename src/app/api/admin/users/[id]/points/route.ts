import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (
    !session?.user ||
    !["SUPER_ADMIN", "STAFF"].includes(session.user.role)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: userId } = await params;
  try {
    const body = await req.json();
    const amount = parseInt(body.amount ?? "0", 10);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "유효한 포인트 금액을 입력해주세요." },
        { status: 400 }
      );
    }

    await prisma.userPoint.upsert({
      where: { userId },
      create: { userId, balance: amount },
      update: { balance: { increment: amount } },
    });

    const point = await prisma.userPoint.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      balance: point?.balance ?? amount,
    });
  } catch {
    return NextResponse.json(
      { error: "포인트 지급 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
