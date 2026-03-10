"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageCircle, Send } from "lucide-react";
import { ROOM_GRADES } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type CommentData = {
  id: string;
  content: string;
  createdAt: Date;
  user: { id: string; name: string | null; image: string | null };
};

type ReviewData = {
  id: string;
  rating: number;
  content: string;
  createdAt: Date;
  user: { id: string; name: string | null; image: string | null };
  room: { id: string; name: string; grade: string };
  comments: CommentData[];
};

export function CommunityFeed({ reviews }: { reviews: ReviewData[] }) {
  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: ReviewData }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>(review.comments);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!session?.user) {
      toast.error("로그인이 필요합니다.");
      return;
    }
    if (!newComment.trim() || newComment.length < 2) {
      toast.error("댓글을 2자 이상 입력하세요.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "댓글 등록 실패");
      }
      const created = await res.json();
      setComments((c) => [...c, created]);
      setNewComment("");
      toast.success("댓글이 등록되었습니다.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "댓글 등록 실패");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <article className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.user.image || ""} />
              <AvatarFallback>
                {review.user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{review.user.name || "익명"}</p>
              <Link
                href={`/rooms/${review.room.id}`}
                className="text-sm text-primary hover:underline"
              >
                {ROOM_GRADES[review.room.grade as keyof typeof ROOM_GRADES]} · {review.room.name}
              </Link>
              <p className="text-xs text-muted-foreground">
                {format(new Date(review.createdAt), "yyyy.MM.dd HH:mm", { locale: ko })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "h-4 w-4",
                  i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted"
                )}
              />
            ))}
          </div>
        </div>
        <p className="mt-4 text-foreground">{review.content}</p>
      </div>

      {comments.length > 0 && (
        <div className="border-t bg-muted/20 px-5 py-3">
          <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            댓글 {comments.length}개
          </p>
          <div className="space-y-3">
            {comments.map((c) => (
              <div key={c.id} className="flex gap-3">
                <Avatar className="h-7 w-7 shrink-0">
                  <AvatarImage src={c.user.image || ""} />
                  <AvatarFallback className="text-xs">
                    {c.user.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{c.user.name || "익명"}</p>
                  <p className="text-sm text-muted-foreground">{c.content}</p>
                  <p className="text-xs text-muted-foreground/80">
                    {format(new Date(c.createdAt), "yyyy.MM.dd HH:mm", { locale: ko })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {session?.user && (
        <div className="border-t px-5 py-3 flex gap-2">
          <Textarea
            placeholder="댓글을 입력하세요..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={2}
            className="min-h-[60px] resize-none"
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={submitting || !newComment.trim()}
            className="shrink-0 h-[60px] w-12"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}
    </article>
  );
}
