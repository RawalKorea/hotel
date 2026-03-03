import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const participant = await prisma.conversationParticipant.findFirst({
    where: { conversationId: id, userId: session.user.id },
  });
  if (!participant) {
    return NextResponse.json({ error: "대화에 접근할 수 없습니다." }, { status: 403 });
  }

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, image: true } },
          attachments: true,
        },
      },
    },
  });

  if (!conv) {
    return NextResponse.json({ error: "대화를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(conv);
}
