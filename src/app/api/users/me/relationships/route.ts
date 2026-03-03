import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const rels = await prisma.userRelationship.findMany({
    where: { userId: session.user.id },
    include: {
      target: { select: { id: true, name: true, email: true, username: true, image: true } },
    },
  });
  return NextResponse.json(rels);
}
