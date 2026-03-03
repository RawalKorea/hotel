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

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, image: true } },
      attachments: true,
    },
  });
  return NextResponse.json(messages);
}

export async function POST(
  req: Request,
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

  const body = await req.json().catch(() => ({}));
  const { content, attachmentUrls } = body as {
    content?: string;
    attachmentUrls?: Array<{ fileUrl: string; fileName: string; fileType?: string }>;
  };

  if (!content?.trim() && (!attachmentUrls || attachmentUrls.length === 0)) {
    return NextResponse.json(
      { error: "메시지 내용 또는 파일을 입력하세요." },
      { status: 400 }
    );
  }

  try {
    const msg = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: session.user.id,
        content: content?.trim() || "",
        attachments: attachmentUrls?.length
          ? {
              create: attachmentUrls.map((a: { fileUrl: string; fileName: string; fileType?: string }) => ({
                fileUrl: a.fileUrl,
                fileName: a.fileName,
                fileType: a.fileType,
              })),
            }
          : undefined,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } },
        attachments: true,
      },
    });

    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(msg, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "메시지 전송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
