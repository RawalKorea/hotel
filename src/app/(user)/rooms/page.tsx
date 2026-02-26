import { prisma } from "@/lib/prisma";
import { RoomSearch } from "@/components/user/room-search";
import type { RoomGrade } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    grade?: string;
    minPrice?: string;
    maxPrice?: string;
    amenities?: string;
  }>;
}) {
  const params = await searchParams;

  const where: Record<string, unknown> = { status: "AVAILABLE" };

  if (params.grade) {
    where.grade = params.grade as RoomGrade;
  }

  if (params.guests) {
    where.maxAdults = { gte: parseInt(params.guests) };
  }

  if (params.minPrice || params.maxPrice) {
    where.pricePerNight = {};
    if (params.minPrice)
      (where.pricePerNight as Record<string, number>).gte = parseInt(params.minPrice);
    if (params.maxPrice)
      (where.pricePerNight as Record<string, number>).lte = parseInt(params.maxPrice);
  }

  if (params.amenities) {
    where.amenities = { hasEvery: params.amenities.split(",") };
  }

  let rooms;
  try {
    rooms = await prisma.room.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        reviews: { select: { rating: true } },
      },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    rooms = [];
  }

  const roomsWithRating = rooms.map((room) => ({
    ...room,
    avgRating:
      room.reviews.length > 0
        ? room.reviews.reduce((sum, r) => sum + r.rating, 0) /
          room.reviews.length
        : null,
    reviewCount: room.reviews.length,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">객실 둘러보기</h1>
        <p className="text-muted-foreground">
          원하시는 조건에 맞는 완벽한 객실을 찾아보세요.
        </p>
      </div>
      <RoomSearch
        rooms={roomsWithRating}
        defaultCheckIn={params.checkIn}
        defaultCheckOut={params.checkOut}
        defaultGuests={params.guests}
      />
    </div>
  );
}
