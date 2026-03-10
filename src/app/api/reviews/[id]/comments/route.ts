import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const commentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const comments = await prisma.reviewComment.findMany({
      where: { reviewId: id },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });
    return NextResponse.json(comments);
  } catch {
    return NextResponse.json({ error: "댓글 조회 실패" }, { status: 500 });
  }
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
  try {
    const review = await prisma.review.findUnique({
      where: { id },
    });
    if (!review) {
      return NextResponse.json({ error: "후기를 찾을 수 없습니다." }, { status: 404 });
    }

    const body = await req.json();
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "내용을 입력하세요." }, { status: 400 });
    }

    const comment = await prisma.reviewComment.create({
      data: {
        reviewId: id,
        userId: session.user.id,
        content: parsed.data.content,
      },
      include: {
        user: { select: { id: true, name: true, image: true } },
      },
    });
    return NextResponse.json(comment, { status: 201 });
  } catch {
    return NextResponse.json({ error: "댓글 등록 실패" }, { status: 500 });
  }
}
