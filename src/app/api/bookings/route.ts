import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { bookingSchema } from "@/lib/validations/booking";
import { differenceInDays } from "date-fns";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = bookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const room = await prisma.room.findUnique({
      where: { id: parsed.data.roomId },
    });

    if (!room) {
      return NextResponse.json(
        { error: "객실을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (room.status !== "AVAILABLE") {
      return NextResponse.json(
        { error: "현재 예약할 수 없는 객실입니다." },
        { status: 400 }
      );
    }

    if (parsed.data.adults > room.maxAdults) {
      return NextResponse.json(
        { error: `최대 성인 ${room.maxAdults}명까지 가능합니다.` },
        { status: 400 }
      );
    }

    const conflicting = await prisma.booking.findFirst({
      where: {
        roomId: parsed.data.roomId,
        status: { in: ["CONFIRMED", "CHECKED_IN"] },
        OR: [
          {
            checkIn: { lt: parsed.data.checkOut },
            checkOut: { gt: parsed.data.checkIn },
          },
        ],
      },
    });

    if (conflicting) {
      return NextResponse.json(
        { error: "해당 날짜에 이미 예약이 있습니다." },
        { status: 409 }
      );
    }

    const nights = differenceInDays(parsed.data.checkOut, parsed.data.checkIn);
    const totalPrice = nights * room.pricePerNight;

    const booking = await prisma.booking.create({
      data: {
        userId: session.user.id,
        roomId: parsed.data.roomId,
        checkIn: parsed.data.checkIn,
        checkOut: parsed.data.checkOut,
        adults: parsed.data.adults,
        children: parsed.data.children,
        totalPrice,
        specialNote: parsed.data.specialNote,
        status: "PENDING",
        payment: {
          create: {
            amount: totalPrice,
            status: "PENDING",
          },
        },
      },
      include: { payment: true },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "예약 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = { userId: session.user.id };
  if (status) where.status = status;

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      room: {
        select: {
          name: true,
          grade: true,
          images: { take: 1, orderBy: { sortOrder: "asc" } },
        },
      },
      payment: { select: { status: true, amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(bookings);
}
