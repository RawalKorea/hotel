"use client";

import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS, BOOKING_STATUS_COLOR } from "@/lib/constants";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

type BookingItem = {
  id: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
  totalPrice: number;
  user: { name: string | null; email: string };
  room: { name: string; grade: string };
};

export function RecentBookings({ bookings }: { bookings: BookingItem[] }) {
  if (bookings.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        아직 예약이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {booking.user.name || booking.user.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {booking.room.name} ·{" "}
              {format(new Date(booking.checkIn), "MM/dd", { locale: ko })} -{" "}
              {format(new Date(booking.checkOut), "MM/dd", { locale: ko })}
            </p>
          </div>
          <Badge
            className={
              BOOKING_STATUS_COLOR[booking.status] || "bg-gray-100 text-gray-800"
            }
            variant="secondary"
          >
            {BOOKING_STATUS[booking.status as keyof typeof BOOKING_STATUS] ||
              booking.status}
          </Badge>
        </div>
      ))}
    </div>
  );
}
