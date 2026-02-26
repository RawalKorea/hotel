import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MyBookingList } from "@/components/user/my-booking-list";

export const dynamic = "force-dynamic";

export default async function MyBookingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let bookings;
  try {
    bookings = await prisma.booking.findMany({
      where: { userId: session.user.id },
      include: {
        room: {
          select: {
            name: true,
            grade: true,
            images: { take: 1, orderBy: { sortOrder: "asc" } },
          },
        },
        payment: { select: { status: true, amount: true, receiptUrl: true } },
        review: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    bookings = [];
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">예약 내역</h1>
      <MyBookingList bookings={bookings} />
    </div>
  );
}
