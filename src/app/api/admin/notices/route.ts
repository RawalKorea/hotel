import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const noticeSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요"),
  content: z.string().min(1, "내용을 입력하세요"),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().optional().default(0),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const publicOnly = searchParams.get("public") === "true";

  if (publicOnly) {
    // 공개 API - 비로그인도 조회 가능
    const notices = await prisma.notice.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(notices);
  }

  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notices = await prisma.notice.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(notices);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = noticeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const notice = await prisma.notice.create({
      data: parsed.data,
    });

    return NextResponse.json(notice, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "공지사항 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
