import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const participants = await prisma.conversationParticipant.findMany({
    where: { userId: session.user.id },
    include: {
      conversation: {
        include: {
          participants: { include: { user: { select: { id: true, name: true, email: true, image: true } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  const list = participants.map((p) => ({
    id: p.conversation.id,
    type: p.conversation.type,
    name: p.conversation.name,
    participants: p.conversation.participants
      .filter((x) => x.userId !== session.user?.id)
      .map((x) => x.user)
      .concat(
        p.conversation.participants.filter((x) => x.userId === session.user?.id).map((x) => x.user)
      ),
    lastMessage: p.conversation.messages[0],
    updatedAt: p.conversation.updatedAt,
  }));

  return NextResponse.json(list);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { type, name, participantIds } = body as {
    type?: string;
    name?: string;
    participantIds?: string[];
  };

  const ids = Array.isArray(participantIds) ? participantIds : [];
  const members = [...new Set([session.user.id, ...ids])];

  try {
    const conv = await prisma.conversation.create({
      data: {
        type: type || "direct",
        name: name || null,
        participants: {
          create: members.map((userId) => ({ userId, role: "member" })),
        },
      },
      include: { participants: true },
    });
    return NextResponse.json(conv, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "대화 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
