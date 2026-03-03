import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: userId } = await params;
  const body = await req.json().catch(() => ({}));
  const { reason, until } = body as { reason?: string; until: string };

  if (!userId || !until) {
    return NextResponse.json(
      { error: "대상 사용자와 정지 종료일을 입력하세요." },
      { status: 400 }
    );
  }

  try {
    await prisma.userSuspension.create({
      data: {
        userId,
        suspendedBy: session.user.id,
        reason: reason || null,
        until: new Date(until),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "정지 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
