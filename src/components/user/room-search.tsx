"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ROOM_GRADES,
  AMENITIES_OPTIONS,
  formatPrice,
} from "@/lib/constants";
import { Star, Users, MapPin, Filter, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Checkbox } from "@/components/ui/checkbox";

type RoomData = {
  id: string;
  name: string;
  description: string;
  grade: string;
  pricePerNight: number;
  maxAdults: number;
  maxChildren: number;
  amenities: string[];
  images: { url: string }[];
  avgRating: number | null;
  reviewCount: number;
};

export function RoomSearch({
  rooms,
  defaultCheckIn: _defaultCheckIn,
  defaultCheckOut: _defaultCheckOut,
  defaultGuests: _defaultGuests,
}: {
  rooms: RoomData[];
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  defaultGuests?: string;
}) {
  const [gradeFilter, setGradeFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("default");
  const [amenityFilter, setAmenityFilter] = useState<string[]>([]);
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>("");

  const filtered = rooms
    .filter((room) => {
      if (gradeFilter !== "ALL" && room.grade !== gradeFilter) return false;
      if (
        maxPriceFilter &&
        room.pricePerNight > parseInt(maxPriceFilter)
      )
        return false;
      if (
        amenityFilter.length > 0 &&
        !amenityFilter.every((a) => room.amenities.includes(a))
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          return a.pricePerNight - b.pricePerNight;
        case "price_desc":
          return b.pricePerNight - a.pricePerNight;
        case "rating":
          return (b.avgRating || 0) - (a.avgRating || 0);
        default:
          return 0;
      }
    });

  const toggleAmenity = (amenity: string) => {
    setAmenityFilter((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Select value={gradeFilter} onValueChange={setGradeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="등급" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체 등급</SelectItem>
            {Object.entries(ROOM_GRADES).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="정렬" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">기본 정렬</SelectItem>
            <SelectItem value="price_asc">가격 낮은순</SelectItem>
            <SelectItem value="price_desc">가격 높은순</SelectItem>
            <SelectItem value="rating">평점 높은순</SelectItem>
          </SelectContent>
        </Select>

        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              상세 필터
              {amenityFilter.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {amenityFilter.length}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>상세 필터</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <Label>최대 가격 (원)</Label>
                <Input
                  type="number"
                  step={50000}
                  placeholder="예: 300000"
                  value={maxPriceFilter}
                  onChange={(e) => setMaxPriceFilter(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>편의시설</Label>
                <div className="space-y-2">
                  {AMENITIES_OPTIONS.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`filter-${amenity}`}
                        checked={amenityFilter.includes(amenity)}
                        onCheckedChange={() => toggleAmenity(amenity)}
                      />
                      <Label
                        htmlFor={`filter-${amenity}`}
                        className="text-sm font-normal"
                      >
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              {amenityFilter.length > 0 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setAmenityFilter([])}
                >
                  <X className="mr-2 h-4 w-4" />
                  필터 초기화
                </Button>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <span className="text-sm text-muted-foreground ml-auto">
          {filtered.length}개의 객실
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((room) => (
          <Link key={room.id} href={`/rooms/${room.id}`}>
            <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all h-full">
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                {room.images[0] ? (
                  <img
                    src={room.images[0].url}
                    alt={room.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <MapPin className="h-8 w-8" />
                  </div>
                )}
              </div>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {ROOM_GRADES[room.grade as keyof typeof ROOM_GRADES]}
                  </Badge>
                  {room.avgRating && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">
                        {room.avgRating.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">
                        ({room.reviewCount})
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {room.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {room.description}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  성인 {room.maxAdults}명 / 아동 {room.maxChildren}명
                </div>
                <div className="flex flex-wrap gap-1">
                  {room.amenities.slice(0, 4).map((a) => (
                    <Badge key={a} variant="secondary" className="text-xs">
                      {a}
                    </Badge>
                  ))}
                  {room.amenities.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{room.amenities.length - 4}
                    </Badge>
                  )}
                </div>
                <div className="pt-2 border-t">
                  <p className="text-xl font-bold">
                    ₩{formatPrice(room.pricePerNight)}
                    <span className="text-sm font-normal text-muted-foreground">
                      {" "}
                      / 박
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <MapPin className="mx-auto mb-4 h-12 w-12" />
          <p className="text-lg font-medium">조건에 맞는 객실이 없습니다.</p>
          <p className="text-sm">필터를 조정해보세요.</p>
        </div>
      )}
    </div>
  );
}
