import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roomSchema } from "@/lib/validations/room";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const grade = searchParams.get("grade");

  const where = grade ? { grade: grade as never } : {};

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where,
      include: { images: { orderBy: { sortOrder: "asc" } } },
      orderBy: { sortOrder: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.room.count({ where }),
  ]);

  return NextResponse.json({ rooms, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = roomSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        ...parsed.data,
        images: body.images?.length
          ? {
              create: body.images.map((url: string, i: number) => ({
                url,
                sortOrder: i,
              })),
            }
          : undefined,
      },
      include: { images: true },
    });

    return NextResponse.json(room, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "객실 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
