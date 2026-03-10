import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;

  const method = await prisma.savedPaymentMethod.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!method) {
    return NextResponse.json(
      { error: "결제 수단을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  await prisma.savedPaymentMethod.delete({ where: { id } });

  if (method.isDefault) {
    const next = await prisma.savedPaymentMethod.findFirst({
      where: { userId: session.user.id },
    });
    if (next) {
      await prisma.savedPaymentMethod.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const method = await prisma.savedPaymentMethod.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!method) {
    return NextResponse.json(
      { error: "결제 수단을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  if (body.isDefault === true) {
    await prisma.savedPaymentMethod.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.savedPaymentMethod.update({
    where: { id },
    data: {
      cardNickname: body.cardNickname ?? method.cardNickname,
      isDefault: body.isDefault ?? method.isDefault,
    },
  });

  return NextResponse.json({
    id: updated.id,
    cardNickname: updated.cardNickname,
    cardNumberMasked: updated.cardNumberMasked,
    isDefault: updated.isDefault,
  });
}
