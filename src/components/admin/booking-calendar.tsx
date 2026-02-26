"use client";

import { useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isWithinInterval,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BOOKING_STATUS_COLOR } from "@/lib/constants";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type BookingData = {
  id: string;
  checkIn: Date;
  checkOut: Date;
  status: string;
  room: { name: string; grade: string };
  user: { name: string | null; email: string | null; username?: string | null; phone: string | null };
};

type RoomOption = { id: string; name: string };

export function BookingCalendar({
  bookings,
  rooms: _rooms,
}: {
  bookings: BookingData[];
  rooms: RoomOption[];
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startDayOfWeek = getDay(monthStart);
  const paddingDays = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const getBookingsForDay = (day: Date) => {
    return bookings.filter((booking) => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      return isWithinInterval(day, { start: checkIn, end: checkOut });
    });
  };

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold">
          {format(currentMonth, "yyyy년 MM월", { locale: ko })}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden">
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-card p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
        {paddingDays.map((i) => (
          <div key={`pad-${i}`} className="bg-card p-2 min-h-[100px]" />
        ))}
        {days.map((day) => {
          const dayBookings = getBookingsForDay(day);
          const isToday =
            format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "bg-card p-2 min-h-[100px]",
                !isSameMonth(day, currentMonth) && "opacity-50"
              )}
            >
              <span
                className={cn(
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm",
                  isToday && "bg-primary text-primary-foreground font-bold"
                )}
              >
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-1">
                {dayBookings.slice(0, 3).map((booking) => (
                  <Tooltip key={booking.id}>
                    <TooltipTrigger asChild>
                      <div>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "w-full justify-start truncate text-xs cursor-pointer",
                            BOOKING_STATUS_COLOR[booking.status]
                          )}
                        >
                          {booking.room.name}
                        </Badge>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="font-medium">{booking.room.name}</p>
                      <p className="text-xs">
                        {booking.user.name || booking.user.email}
                      </p>
                      <p className="text-xs">
                        {format(new Date(booking.checkIn), "MM/dd")} -{" "}
                        {format(new Date(booking.checkOut), "MM/dd")}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {dayBookings.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{dayBookings.length - 3}건
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
