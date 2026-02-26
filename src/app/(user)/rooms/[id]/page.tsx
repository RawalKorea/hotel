import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ROOM_GRADES, formatPrice } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Users, Check } from "lucide-react";
import { RoomBookingForm } from "@/components/user/room-booking-form";
import { RoomImageGallery } from "@/components/user/room-image-gallery";
import { RoomReviews } from "@/components/user/room-reviews";

export const dynamic = "force-dynamic";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let room;
  try {
    room = await prisma.room.findUnique({
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
  } catch {
    notFound();
  }

  if (!room) notFound();

  const avgRating =
    room.reviews.length > 0
      ? room.reviews.reduce((sum, r) => sum + r.rating, 0) /
        room.reviews.length
      : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <RoomImageGallery images={room.images} name={room.name} />

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Room Info */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="text-sm">
                {ROOM_GRADES[room.grade as keyof typeof ROOM_GRADES]}
              </Badge>
              {avgRating && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{avgRating.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground">
                    ({room.reviews.length}개의 리뷰)
                  </span>
                </div>
              )}
            </div>
            <h1 className="text-3xl font-bold">{room.name}</h1>
          </div>

          <Separator />

          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                성인 최대 {room.maxAdults}명 · 아동 최대 {room.maxChildren}명
              </span>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">객실 소개</h2>
            <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
              {room.description}
            </p>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-semibold mb-3">편의시설</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {room.amenities.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <RoomReviews reviews={room.reviews} avgRating={avgRating} />
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <RoomBookingForm
              roomId={room.id}
              pricePerNight={room.pricePerNight}
              maxAdults={room.maxAdults}
              maxChildren={room.maxChildren}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
