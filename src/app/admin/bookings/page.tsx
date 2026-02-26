import { AdminHeader } from "@/components/admin/admin-header";
import { prisma } from "@/lib/prisma";
import { BookingManager } from "@/components/admin/booking-manager";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    include: {
      user: { select: { name: true, email: true, phone: true } },
      room: { select: { name: true, grade: true } },
      payment: { select: { status: true, amount: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const rooms = await prisma.room.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <AdminHeader title="예약 관리" />
      <div className="p-6">
        <BookingManager initialBookings={bookings} rooms={rooms} />
      </div>
    </>
  );
}
