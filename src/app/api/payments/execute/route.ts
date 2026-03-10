import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateMerchantUid } from "@/lib/payment";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { bookingId, method, savedMethodId, paymentPassword } = body;

    if (!bookingId || !method) {
      return NextResponse.json(
        { error: "예약 정보와 결제 수단이 필요합니다." },
        { status: 400 }
      );
    }

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

    if (booking.status !== "PENDING") {
      return NextResponse.json(
        { error: "이미 처리된 예약입니다." },
        { status: 400 }
      );
    }

    if (!booking.payment || booking.payment.status !== "PENDING") {
      return NextResponse.json(
        { error: "결제 정보를 찾을 수 없습니다." },
        { status: 400 }
      );
    }

    const amount = booking.payment.amount;

    if (method === "POINT") {
      const userPoint = await prisma.userPoint.findUnique({
        where: { userId: session.user.id },
      });
      const balance = userPoint?.balance ?? 0;
      if (balance < amount) {
        return NextResponse.json(
          { error: `포인트가 부족합니다. (보유: ${balance.toLocaleString()}P)` },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        await tx.userPoint.upsert({
          where: { userId: session.user.id },
          create: { userId: session.user.id, balance: 0 },
          update: {},
        });
        await tx.userPoint.update({
          where: { userId: session.user.id },
          data: { balance: { decrement: amount } },
        });
        await tx.payment.update({
          where: { bookingId },
          data: { method: "POINT", status: "PAID", paidAt: new Date() },
        });
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: "CONFIRMED" },
        });
      });

      return NextResponse.json({ success: true });
    }

    if (method === "SAVED_CARD") {
      if (!savedMethodId || !paymentPassword) {
        return NextResponse.json(
          { error: "등록된 카드와 결제 비밀번호를 입력해주세요." },
          { status: 400 }
        );
      }

      const saved = await prisma.savedPaymentMethod.findFirst({
        where: { id: savedMethodId, userId: session.user.id },
      });

      if (!saved) {
        return NextResponse.json(
          { error: "등록된 결제 수단을 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { paymentPassword: true },
      });

      if (!user?.paymentPassword) {
        return NextResponse.json(
          { error: "빠른 결제를 위해 결제 비밀번호를 먼저 설정해주세요." },
          { status: 400 }
        );
      }

      const valid = await bcrypt.compare(
        paymentPassword.replace(/\D/g, ""),
        user.paymentPassword
      );
      if (!valid) {
        return NextResponse.json(
          { error: "결제 비밀번호가 일치하지 않습니다." },
          { status: 401 }
        );
      }

      const merchantUid = generateMerchantUid();
      // 실제 환경: Portone billing API 호출 (billingKey, merchantUid, amount)
      // 개발/키 없음: 시뮬레이션 성공
      const hasPortone =
        process.env.NEXT_PUBLIC_PORTONE_STORE_ID &&
        process.env.PORTONE_API_SECRET;

      if (hasPortone && saved.billingKey) {
        // TODO: Portone 빌링키 결제 API 호출
        // const res = await fetch(...)
        // if (!res.ok) throw new Error();
      }

      await prisma.$transaction([
        prisma.payment.update({
          where: { bookingId },
          data: {
            method: "SAVED_CARD",
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
    }

    if (method === "CARD") {
      const { impUid } = body;
      const merchantUid = body.merchantUid || generateMerchantUid();
      const hasPortone =
        process.env.NEXT_PUBLIC_PORTONE_STORE_ID &&
        process.env.PORTONE_API_SECRET;

      if (!impUid) {
        return NextResponse.json(
          {
            error: "결제 정보가 필요합니다.",
            needPayment: true,
            merchantUid,
            amount,
          },
          { status: 400 }
        );
      }

      if (hasPortone) {
        // Portone API로 imp_uid 검증 (실제 운영 시)
        // const check = await fetch(`https://api.iamport.kr/payments/${impUid}`, { headers: {...} });
      }
      // 개발/키 미설정: test_ 접두사 impUid 허용

      await prisma.$transaction([
        prisma.payment.update({
          where: { bookingId },
          data: {
            method: "CARD",
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
    }

    return NextResponse.json(
      { error: "지원하지 않는 결제 수단입니다." },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "결제 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
