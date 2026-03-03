import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const admin = searchParams.get("admin") === "true";

  if (admin) {
    const session = await auth();
    if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const events = await prisma.event.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
    return NextResponse.json(events);
  }

  const now = new Date();
  const events = await prisma.event.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startAt: null }, { startAt: { lte: now } }] },
        { OR: [{ endAt: null }, { endAt: { gte: now } }] },
      ],
    },
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, imageUrl, linkUrl, sortOrder, isActive, startAt, endAt } = body;
    const event = await prisma.event.create({
      data: {
        name: name || "이벤트",
        description: description || null,
        imageUrl: imageUrl || null,
        linkUrl: linkUrl || null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive !== false,
        startAt: startAt ? new Date(startAt) : null,
        endAt: endAt ? new Date(endAt) : null,
      },
    });
    return NextResponse.json(event, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "이벤트 등록 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
