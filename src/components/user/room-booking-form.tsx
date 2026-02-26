"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { format, differenceInDays } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function RoomBookingForm({
  roomId,
  pricePerNight,
  maxAdults,
  maxChildren,
}: {
  roomId: string;
  pricePerNight: number;
  maxAdults: number;
  maxChildren: number;
}) {
  const router = useRouter();
  const { data: session } = useSession();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [adults, setAdults] = useState("1");
  const [children, setChildren] = useState("0");
  const [specialNote, setSpecialNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const nights =
    checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalPrice = nights * pricePerNight;

  const handleBooking = async () => {
    if (!session?.user) {
      toast.error("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    if (!checkIn || !checkOut) {
      toast.error("체크인/체크아웃 날짜를 선택해주세요.");
      return;
    }

    if (nights < 1) {
      toast.error("최소 1박 이상 예약해야 합니다.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          adults: parseInt(adults),
          children: parseInt(children),
          specialNote,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      const booking = await res.json();
      toast.success("예약이 완료되었습니다!");
      router.push(`/mypage/bookings/${booking.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "예약 중 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">
            ₩{formatPrice(pricePerNight)}
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            / 박
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs">체크인</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !checkIn && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {checkIn
                    ? format(checkIn, "MM/dd", { locale: ko })
                    : "날짜 선택"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={checkIn}
                  onSelect={setCheckIn}
                  disabled={(date) => date < new Date()}
                  locale={ko}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">체크아웃</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal h-10",
                    !checkOut && "text-muted-foreground"
                  )}
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {checkOut
                    ? format(checkOut, "MM/dd", { locale: ko })
                    : "날짜 선택"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={checkOut}
                  onSelect={setCheckOut}
                  disabled={(date) => date < (checkIn || new Date())}
                  locale={ko}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1.5">
            <Label className="text-xs">성인</Label>
            <Select value={adults} onValueChange={setAdults}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxAdults }, (_, i) => i + 1).map(
                  (n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n}명
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">아동</Label>
            <Select value={children} onValueChange={setChildren}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxChildren + 1 }, (_, i) => i).map(
                  (n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n}명
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">특별 요청사항 (선택)</Label>
          <Textarea
            placeholder="요청사항을 입력해주세요..."
            rows={2}
            value={specialNote}
            onChange={(e) => setSpecialNote(e.target.value)}
          />
        </div>

        {nights > 0 && (
          <>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  ₩{formatPrice(pricePerNight)} × {nights}박
                </span>
                <span>₩{formatPrice(totalPrice)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-base">
                <span>총 금액</span>
                <span>₩{formatPrice(totalPrice)}</span>
              </div>
            </div>
          </>
        )}

        <Button
          className="w-full"
          size="lg"
          onClick={handleBooking}
          disabled={isLoading || !checkIn || !checkOut}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {session?.user ? "예약하기" : "로그인 후 예약"}
        </Button>
      </CardContent>
    </Card>
  );
}
