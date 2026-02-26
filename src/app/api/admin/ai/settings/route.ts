import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const existing = await prisma.chatbotSettings.findFirst();

    if (existing) {
      const settings = await prisma.chatbotSettings.update({
        where: { id: existing.id },
        data: {
          toneManner: body.toneManner,
          greeting: body.greeting,
          systemPrompt: body.systemPrompt,
        },
      });
      return NextResponse.json(settings);
    } else {
      const settings = await prisma.chatbotSettings.create({
        data: {
          toneManner: body.toneManner,
          greeting: body.greeting,
          systemPrompt: body.systemPrompt,
        },
      });
      return NextResponse.json(settings, { status: 201 });
    }
  } catch {
    return NextResponse.json(
      { error: "설정 저장 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
