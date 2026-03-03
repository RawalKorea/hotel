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

  const { id } = await params;

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: { user: { select: { name: true, email: true } } },
  });

  if (!inquiry) {
    return NextResponse.json(
      { error: "문의를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json(inquiry);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { status, reply } = body as {
      status?: string;
      reply?: string;
    };

    const data: Record<string, unknown> = {};
    if (status) {
      if (!["PENDING", "IN_PROGRESS", "RESOLVED", "CLOSED"].includes(status)) {
        return NextResponse.json(
          { error: "올바른 상태가 아닙니다." },
          { status: 400 }
        );
      }
      data.status = status;
    }
    if (reply !== undefined) {
      data.reply = reply;
      data.repliedAt = reply ? new Date() : null;
    }

    const inquiry = await prisma.inquiry.update({
      where: { id },
      data: data as never,
    });

    return NextResponse.json(inquiry);
  } catch {
    return NextResponse.json(
      { error: "수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
