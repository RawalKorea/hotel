import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reviewSchema } from "@/lib/validations/booking";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { review: true },
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

    if (booking.status !== "CHECKED_OUT") {
      return NextResponse.json(
        { error: "체크아웃 후에만 리뷰를 작성할 수 있습니다." },
        { status: 400 }
      );
    }

    if (booking.review) {
      return NextResponse.json(
        { error: "이미 리뷰를 작성하셨습니다." },
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        roomId: booking.roomId,
        bookingId: id,
        rating: parsed.data.rating,
        content: parsed.data.content,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "리뷰 작성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
