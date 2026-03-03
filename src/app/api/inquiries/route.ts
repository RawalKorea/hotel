import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const inquirySchema = z.object({
  name: z.string().min(1, "이름을 입력하세요"),
  email: z.string().email("올바른 이메일을 입력하세요"),
  phone: z.string().optional(),
  subject: z.string().min(1, "제목을 입력하세요"),
  content: z.string().min(1, "내용을 입력하세요"),
  userId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = inquirySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject,
        content: parsed.data.content,
        userId: parsed.data.userId || null,
      },
    });

    return NextResponse.json(
      { success: true, id: inquiry.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "문의 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
