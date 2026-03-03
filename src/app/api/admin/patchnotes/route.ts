import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const publicOnly = searchParams.get("public") === "true";

  if (publicOnly) {
    const notes = await prisma.patchNote.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json(notes);
  }

  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notes = await prisma.patchNote.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { version, title, content } = body as {
      version: string;
      title: string;
      content: string;
    };

    if (!version?.trim() || !title?.trim() || !content?.trim()) {
      return NextResponse.json(
        { error: "버전, 제목, 내용을 모두 입력하세요." },
        { status: 400 }
      );
    }

    const note = await prisma.patchNote.create({
      data: { version, title, content },
    });
    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "패치 노트 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
