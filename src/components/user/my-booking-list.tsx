"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  BOOKING_STATUS,
  BOOKING_STATUS_COLOR,
  ROOM_GRADES,
  formatPrice,
} from "@/lib/constants";
import { Star, MapPin, Loader2, CalendarDays } from "lucide-react";
import { toast } from "sonner";

export type BookingItem = {
  id: string;
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  totalPrice: number;
  status: string;
  createdAt: Date;
  room: {
    name: string;
    grade: string;
    images: { url: string }[];
  };
  payment: { status: string; amount: number; receiptUrl: string | null } | null;
  review: { id: string } | null;
};

export function MyBookingList({ bookings }: { bookings: BookingItem[] }) {
  const [reviewDialog, setReviewDialog] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async () => {
    if (!reviewDialog) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/bookings/${reviewDialog}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, content: reviewContent }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }

      toast.success("리뷰가 작성되었습니다!");
      setReviewDialog(null);
      setReviewContent("");
      setRating(5);
      window.location.reload();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "리뷰 작성 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <CalendarDays className="mx-auto mb-4 h-12 w-12" />
        <p className="text-lg font-medium">예약 내역이 없습니다.</p>
        <p className="text-sm">새로운 여행을 계획해보세요!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-48 h-32 bg-muted flex-shrink-0">
                  {booking.room.images[0] ? (
                    <img
                      src={booking.room.images[0].url}
                      alt={booking.room.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-1">
                        {
                          ROOM_GRADES[
                            booking.room.grade as keyof typeof ROOM_GRADES
                          ]
                        }
                      </Badge>
                      <h3 className="font-semibold text-lg">
                        {booking.room.name}
                      </h3>
                    </div>
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
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      {format(new Date(booking.checkIn), "yyyy.MM.dd (EEE)", {
                        locale: ko,
                      })}{" "}
                      ~{" "}
                      {format(new Date(booking.checkOut), "yyyy.MM.dd (EEE)", {
                        locale: ko,
                      })}
                    </p>
                    <p>
                      성인 {booking.adults}명 / 아동 {booking.children}명
                    </p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold">
                      ₩{formatPrice(booking.totalPrice)}
                    </p>
                    <div className="flex gap-2">
                      {booking.status === "CHECKED_OUT" && !booking.review && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setReviewDialog(booking.id)}
                        >
                          <Star className="mr-1 h-3 w-3" />
                          리뷰 작성
                        </Button>
                      )}
                      {booking.review && (
                        <Badge variant="secondary" className="gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          리뷰 완료
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog
        open={!!reviewDialog}
        onOpenChange={() => setReviewDialog(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>리뷰 작성</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>평점</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>내용</Label>
              <Textarea
                placeholder="투숙 경험을 공유해주세요 (최소 10자)"
                rows={4}
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSubmitReview}
              disabled={isSubmitting || reviewContent.length < 10}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              리뷰 등록
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
