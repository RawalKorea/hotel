"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from "lucide-react";

type ReviewData = {
  id: string;
  rating: number;
  content: string;
  createdAt: Date;
  user: { name: string | null; image: string | null };
};

export function RoomReviews({
  reviews,
  avgRating,
}: {
  reviews: ReviewData[];
  avgRating: number | null;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold">리뷰</h2>
        {avgRating && (
          <div className="flex items-center gap-1">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="text-lg font-bold">{avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground">
              · {reviews.length}개의 리뷰
            </span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-muted-foreground">아직 리뷰가 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-lg border p-4">
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={review.user.image || ""} />
                  <AvatarFallback>
                    {review.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {review.user.name || "익명"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(review.createdAt), "yyyy.MM.dd", {
                      locale: ko,
                    })}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-3.5 w-3.5",
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{review.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
