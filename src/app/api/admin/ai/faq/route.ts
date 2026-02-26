import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { question, answer, category } = await req.json();

    if (!question || !answer) {
      return NextResponse.json(
        { error: "질문과 답변을 입력해주세요." },
        { status: 400 }
      );
    }

    const faq = await prisma.fAQEntry.create({
      data: {
        question,
        answer,
        category: category || null,
      },
    });

    return NextResponse.json(faq, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "FAQ 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
