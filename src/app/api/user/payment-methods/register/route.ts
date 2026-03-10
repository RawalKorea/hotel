import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPayment, isPortoneConfigured } from "@/lib/portone";

/**
 * Portone 빌링키 발급 완료 후 호출
 * - imp_uid로 결제 정보 조회 후 카드 정보 저장
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!isPortoneConfigured()) {
    return NextResponse.json(
      { error: "Portone이 설정되지 않아 카드 등록을 할 수 없습니다." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { imp_uid, customer_uid, card_nickname } = body;

    if (!imp_uid || !customer_uid) {
      return NextResponse.json(
        { error: "imp_uid와 customer_uid가 필요합니다." },
        { status: 400 }
      );
    }

    const payment = await getPayment(imp_uid);
    if (!payment) {
      return NextResponse.json(
        { error: "결제 정보를 조회할 수 없습니다." },
        { status: 400 }
      );
    }

    if (payment.status?.toLowerCase() !== "paid") {
      return NextResponse.json(
        { error: "유효한 결제가 아닙니다." },
        { status: 400 }
      );
    }

    const cardMasked =
      payment.card_number || payment.card_number_mask || "****-****-****-****";

    const isFirst = await prisma.savedPaymentMethod.count({
      where: { userId: session.user.id },
    });

    const saved = await prisma.savedPaymentMethod.create({
      data: {
        userId: session.user.id,
        cardNickname: card_nickname?.trim() || null,
        cardNumberMasked: cardMasked,
        billingKey: customer_uid,
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
