import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const { impUid, merchantUid, bookingId } = await req.json();

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "예약을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    // Portone API를 통한 결제 검증 (실제 운영 시)
    // const portoneRes = await fetch(`https://api.iamport.kr/payments/${impUid}`, ...);

    // 결제 성공 처리
    await prisma.$transaction([
      prisma.payment.update({
        where: { bookingId },
        data: {
          impUid,
          merchantUid,
          status: "PAID",
          paidAt: new Date(),
        },
      }),
      prisma.booking.update({
        where: { id: bookingId },
        data: { status: "CONFIRMED" },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "결제 검증 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
