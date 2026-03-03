import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: userId } = await params;
  const rels = await prisma.userRelationship.findMany({
    where: { userId },
    include: {
      target: { select: { id: true, name: true, email: true, username: true } },
    },
  });
  return NextResponse.json(rels);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: userId } = await params;
  const body = await req.json();
  const { targetId, type } = body as { targetId: string; type: "FRIEND" | "FAMILY" | "PARTNERS" };

  if (!targetId || !type || !["FRIEND", "FAMILY", "PARTNERS"].includes(type)) {
    return NextResponse.json(
      { error: "targetId와 type(FRIEND|FAMILY|PARTNERS)을 입력하세요." },
      { status: 400 }
    );
  }
  if (userId === targetId) {
    return NextResponse.json({ error: "자기 자신과는 관계를 설정할 수 없습니다." }, { status: 400 });
  }

  try {
    await prisma.userRelationship.upsert({
      where: {
        userId_targetId_type: { userId, targetId, type },
      },
      create: { userId, targetId, type, createdBy: session.user.id },
      update: {},
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "관계 설정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: userId } = await params;
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get("targetId");
  const type = searchParams.get("type");

  if (!targetId || !type) {
    return NextResponse.json(
      { error: "targetId와 type 쿼리 파라미터가 필요합니다." },
      { status: 400 }
    );
  }

  try {
    await prisma.userRelationship.deleteMany({
      where: { userId, targetId, type: type as "FRIEND" | "FAMILY" | "PARTNERS" },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "관계 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
