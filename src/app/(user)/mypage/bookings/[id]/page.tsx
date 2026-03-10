import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROOM_GRADES, formatPrice, BOOKING_STATUS } from "@/lib/constants";
import { BookingPaymentCard } from "@/components/user/booking-payment-card";

export const dynamic = "force-dynamic";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) notFound();

  const { id } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      room: {
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      },
      payment: true,
    },
  });

  if (!booking || booking.userId !== session.user.id) notFound();

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">예약 상세</h1>

      <div className="rounded-lg border bg-card overflow-hidden">
        {booking.room.images[0] && (
          <img
            src={booking.room.images[0].url}
            alt={booking.room.name}
            className="w-full h-40 object-cover"
          />
        )}
        <div className="p-4 space-y-3">
          <div className="flex justify-between">
            <span className="font-semibold text-lg">{booking.room.name}</span>
            <span className="text-sm text-muted-foreground">
              {ROOM_GRADES[booking.room.grade as keyof typeof ROOM_GRADES]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(booking.checkIn).toLocaleDateString("ko-KR")} ~{" "}
            {new Date(booking.checkOut).toLocaleDateString("ko-KR")} · 성인{" "}
            {booking.adults}명 / 아동 {booking.children}명
          </p>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="font-bold text-lg">
              ₩{formatPrice(booking.totalPrice)}
            </span>
            <span
              className={`text-sm px-2 py-1 rounded ${
                booking.status === "PENDING"
                  ? "bg-yellow-100 text-yellow-800"
                  : booking.status === "CONFIRMED"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {BOOKING_STATUS[booking.status as keyof typeof BOOKING_STATUS] ||
                booking.status}
            </span>
          </div>
        </div>
      </div>

      <BookingPaymentCard
        bookingId={booking.id}
        status={booking.status}
        paymentStatus={booking.payment?.status ?? "PENDING"}
        amount={booking.payment?.amount ?? booking.totalPrice}
      />
    </div>
  );
}
