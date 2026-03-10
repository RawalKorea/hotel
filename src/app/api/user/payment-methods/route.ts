import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const methods = await prisma.savedPaymentMethod.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(
    methods.map((m) => ({
      id: m.id,
      cardNickname: m.cardNickname,
      cardNumberMasked: m.cardNumberMasked,
      isDefault: m.isDefault,
    }))
  );
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { cardNickname, cardNumberMasked, billingKey } = body;

    const isFirst = await prisma.savedPaymentMethod.count({
      where: { userId: session.user.id },
    });

    const saved = await prisma.savedPaymentMethod.create({
      data: {
        userId: session.user.id,
        cardNickname: cardNickname || null,
        cardNumberMasked: cardNumberMasked || "****-****-****-****",
        billingKey: billingKey || null,
        isDefault: isFirst === 0,
      },
    });

    return NextResponse.json({
      id: saved.id,
      cardNickname: saved.cardNickname,
      cardNumberMasked: saved.cardNumberMasked,
      isDefault: saved.isDefault,
    });
  } catch {
    return NextResponse.json(
      { error: "결제 수단 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
