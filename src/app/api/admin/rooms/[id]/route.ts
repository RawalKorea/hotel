import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { roomSchema } from "@/lib/validations/room";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const room = await prisma.room.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!room) {
    return NextResponse.json({ error: "객실을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json(room);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !["SUPER_ADMIN", "STAFF"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = roomSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    if (body.images) {
      await prisma.roomImage.deleteMany({ where: { roomId: id } });
    }

    const room = await prisma.room.update({
      where: { id },
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

    return NextResponse.json(room);
  } catch {
    return NextResponse.json(
      { error: "객실 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.room.delete({ where: { id } });
    return NextResponse.json({ message: "객실이 삭제되었습니다." });
  } catch {
    return NextResponse.json(
      { error: "객실 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
