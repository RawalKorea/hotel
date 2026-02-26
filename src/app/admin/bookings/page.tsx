import { AdminHeader } from "@/components/admin/admin-header";
import { prisma } from "@/lib/prisma";
import { BookingManager } from "@/components/admin/booking-manager";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  let bookings;
  let rooms;
  try {
    [bookings, rooms] = await Promise.all([
      prisma.booking.findMany({
        include: {
          user: { select: { name: true, email: true, phone: true } },
          room: { select: { name: true, grade: true } },
          payment: { select: { status: true, amount: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.room.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);
  } catch {
    bookings = [];
    rooms = [];
  }

  return (
    <>
      <AdminHeader title="예약 관리" />
      <div className="p-6">
        <BookingManager initialBookings={bookings} rooms={rooms} />
      </div>
    </>
  );
}
