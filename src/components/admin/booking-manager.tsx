"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BOOKING_STATUS,
  BOOKING_STATUS_COLOR,
  ROOM_GRADES,
  formatPrice,
} from "@/lib/constants";
import { CalendarDays, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { BookingCalendar } from "./booking-calendar";

type BookingData = {
  id: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  totalPrice: number;
  status: string;
  createdAt: Date;
  user: { name: string | null; email: string; phone: string | null };
  room: { name: string; grade: string };
  payment: { status: string; amount: number } | null;
};

type RoomOption = { id: string; name: string };

export function BookingManager({
  initialBookings,
  rooms,
}: {
  initialBookings: BookingData[];
  rooms: RoomOption[];
}) {
  const [bookings, setBookings] = useState(initialBookings);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filtered =
    statusFilter === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error();

      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );
      toast.success("예약 상태가 변경되었습니다.");
    } catch {
      toast.error("상태 변경 중 오류가 발생했습니다.");
    }
  };

  return (
    <Tabs defaultValue="list" className="space-y-4">
      <div className="flex items-center justify-between">
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <List className="h-4 w-4" />
            리스트
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            캘린더
          </TabsTrigger>
        </TabsList>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="상태 필터" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            {Object.entries(BOOKING_STATUS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <TabsContent value="list">
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>고객</TableHead>
                <TableHead>객실</TableHead>
                <TableHead>체크인</TableHead>
                <TableHead>체크아웃</TableHead>
                <TableHead>인원</TableHead>
                <TableHead>금액</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-32 text-center text-muted-foreground"
                  >
                    예약 내역이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {booking.user.name || "이름 없음"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {booking.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.room.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {
                            ROOM_GRADES[
                              booking.room.grade as keyof typeof ROOM_GRADES
                            ]
                          }
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.checkIn), "yyyy.MM.dd", {
                        locale: ko,
                      })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(booking.checkOut), "yyyy.MM.dd", {
                        locale: ko,
                      })}
                    </TableCell>
                    <TableCell>
                      성인 {booking.adults} / 아동 {booking.children}
                    </TableCell>
                    <TableCell>₩{formatPrice(booking.totalPrice)}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          BOOKING_STATUS_COLOR[booking.status] ||
                          "bg-gray-100 text-gray-800"
                        }
                        variant="secondary"
                      >
                        {BOOKING_STATUS[
                          booking.status as keyof typeof BOOKING_STATUS
                        ] || booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={booking.status}
                        onValueChange={(v) =>
                          handleStatusChange(booking.id, v)
                        }
                      >
                        <SelectTrigger className="h-8 w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(BOOKING_STATUS).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>

      <TabsContent value="calendar">
        <BookingCalendar bookings={filtered} rooms={rooms} />
      </TabsContent>
    </Tabs>
  );
}
