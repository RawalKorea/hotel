import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { RoomSearch } from "@/components/user/room-search";
import { SearchBar } from "@/components/user/search-bar";
import type { RoomGrade } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    adults?: string;
    children?: string;
    grade?: string;
    minPrice?: string;
    maxPrice?: string;
    amenities?: string;
  }>;
}) {
  const params = await searchParams;

  const adults = parseInt(params.adults || params.guests || "2") || 2;
  const children = parseInt(params.children || "0") || 0;
  const checkIn = params.checkIn ? new Date(params.checkIn) : null;
  const checkOut = params.checkOut ? new Date(params.checkOut) : null;
  const hasValidDates =
    checkIn &&
    checkOut &&
    !isNaN(checkIn.getTime()) &&
    !isNaN(checkOut.getTime()) &&
    checkOut > checkIn;

  const where: Record<string, unknown> = { status: "AVAILABLE" };

  if (params.grade) {
    where.grade = params.grade as RoomGrade;
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

  type RoomWithReviews = Prisma.RoomGetPayload<{
    include: {
      images: true;
      reviews: { select: { rating: true } };
      bookings: { select: { id: true; checkIn: true; checkOut: true; status: true } };
    };
  }>;
  let rooms: RoomWithReviews[];
  try {
    rooms = await prisma.room.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        reviews: { select: { rating: true } },
        bookings: {
          select: { id: true, checkIn: true, checkOut: true, status: true },
          where: { status: { not: "CANCELLED" } },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    rooms = [] as typeof rooms;
  }

  const fitsCapacity = (r: RoomWithReviews) =>
    r.maxAdults >= adults && r.maxChildren >= children;

  const isAvailable = (r: RoomWithReviews) => {
    if (!hasValidDates || !checkIn || !checkOut) return true;
    return !r.bookings.some(
      (b) =>
        b.checkIn < checkOut &&
        new Date(b.checkOut) > checkIn
    );
  };

  const exactMatch: RoomWithReviews[] = [];
  const similar: RoomWithReviews[] = [];
  const other: RoomWithReviews[] = [];

  for (const r of rooms) {
    const avail = isAvailable(r);
    const fits = fitsCapacity(r);
    if (avail && fits) exactMatch.push(r);
    else if (avail || fits) similar.push(r);
    else other.push(r);
  }

  const orderedRooms = [...exactMatch, ...similar, ...other];

  const roomsWithRating = orderedRooms.map(({ bookings: _b, ...room }) => ({
    ...room,
    avgRating:
      room.reviews.length > 0
        ? room.reviews.reduce((sum, r) => sum + r.rating, 0) /
          room.reviews.length
        : null,
    reviewCount: room.reviews.length,
  }));

  const searchQuery = new URLSearchParams();
  if (params.checkIn) searchQuery.set("checkIn", params.checkIn);
  if (params.checkOut) searchQuery.set("checkOut", params.checkOut);
  searchQuery.set("adults", adults.toString());
  searchQuery.set("children", children.toString());
  const queryString = searchQuery.toString();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">객실 둘러보기</h1>
        <p className="text-muted-foreground mb-4">
          원하시는 조건에 맞는 완벽한 객실을 찾아보세요.
        </p>
        <SearchBar
          defaultCheckIn={params.checkIn}
          defaultCheckOut={params.checkOut}
          defaultAdults={adults.toString()}
          defaultChildren={children.toString()}
        />
      </div>
      <RoomSearch
        rooms={roomsWithRating}
        defaultCheckIn={params.checkIn}
        defaultCheckOut={params.checkOut}
        defaultAdults={adults.toString()}
        defaultChildren={children.toString()}
        queryString={queryString}
        noExactMatch={!!(hasValidDates && exactMatch.length === 0)}
      />
    </div>
  );
}
