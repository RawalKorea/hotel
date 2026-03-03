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
  const { reason, until } = body as { reason?: string; until?: string };

  if (!userId) {
    return NextResponse.json({ error: "대상 사용자가 없습니다." }, { status: 400 });
  }

  try {
    await prisma.userBan.create({
      data: {
        userId,
        bannedBy: session.user.id,
        reason: reason || null,
        until: until ? new Date(until) : null,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "밴 처리 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: userId } = await params;
  try {
    await prisma.userBan.deleteMany({ where: { userId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "밴 해제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
