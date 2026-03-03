import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id: targetId } = await params;
  if (!targetId || targetId === session.user.id) {
    return NextResponse.json(
      { error: "자기 자신은 차단할 수 없습니다." },
      { status: 400 }
    );
  }

  try {
    await prisma.userBlock.upsert({
      where: {
        blockerId_blockedId: {
          blockerId: session.user.id,
          blockedId: targetId,
        },
      },
      create: { blockerId: session.user.id, blockedId: targetId },
      update: {},
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "차단 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id: targetId } = await params;
  try {
    await prisma.userBlock.deleteMany({
      where: {
        blockerId: session.user.id,
        blockedId: targetId,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "차단 해제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
