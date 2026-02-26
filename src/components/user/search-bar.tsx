"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { CalendarDays, Search, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState("2");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set("checkIn", format(checkIn, "yyyy-MM-dd"));
    if (checkOut) params.set("checkOut", format(checkOut, "yyyy-MM-dd"));
    params.set("guests", guests);
    router.push(`/rooms?${params.toString()}`);
  };

  return (
    <div className="rounded-2xl bg-white/10 backdrop-blur-md p-2 md:p-3 shadow-2xl">
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "flex-1 justify-start gap-2 bg-white/90 hover:bg-white text-left font-normal h-12 rounded-xl",
                !checkIn && "text-muted-foreground"
              )}
            >
              <CalendarDays className="h-4 w-4" />
              {checkIn
                ? format(checkIn, "yyyy년 MM월 dd일", { locale: ko })
                : "체크인 날짜"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkIn}
              onSelect={setCheckIn}
              disabled={(date) => date < new Date()}
              locale={ko}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "flex-1 justify-start gap-2 bg-white/90 hover:bg-white text-left font-normal h-12 rounded-xl",
                !checkOut && "text-muted-foreground"
              )}
            >
              <CalendarDays className="h-4 w-4" />
              {checkOut
                ? format(checkOut, "yyyy년 MM월 dd일", { locale: ko })
                : "체크아웃 날짜"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={checkOut}
              onSelect={setCheckOut}
              disabled={(date) =>
                date < (checkIn || new Date())
              }
              locale={ko}
            />
          </PopoverContent>
        </Popover>

        <Select value={guests} onValueChange={setGuests}>
          <SelectTrigger className="flex-1 gap-2 bg-white/90 hover:bg-white h-12 rounded-xl border-0">
            <Users className="h-4 w-4" />
            <SelectValue placeholder="인원" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SelectItem key={n} value={n.toString()}>
                성인 {n}명
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={handleSearch}
          size="lg"
          className="h-12 rounded-xl px-8"
        >
          <Search className="mr-2 h-4 w-4" />
          검색
        </Button>
      </div>
    </div>
  );
}
