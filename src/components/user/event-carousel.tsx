"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type EventItem = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
};

export function EventCarousel() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [index, setIndex] = useState(0);
  const [detailEvent, setDetailEvent] = useState<EventItem | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then(setEvents)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (events.length <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % events.length);
    }, 5000);
    return () => clearInterval(id);
  }, [events.length]);

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + events.length) % events.length);
  }, [events.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % events.length);
  }, [events.length]);

  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (touchStart == null || touchEnd == null) return;
    const diff = touchStart - touchEnd;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (events.length === 0) return null;

  const current = events[index];

  return (
    <>
      <section
        className="relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="relative aspect-[21/9] md:aspect-[3/1] bg-muted">
          {events.map((e, i) => (
            <div
              key={e.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                i === index ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {e.imageUrl ? (
                <img
                  src={e.imageUrl}
                  alt={e.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-primary/20 to-primary/10" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                <h2 className="text-2xl md:text-4xl font-bold mb-2">{e.name}</h2>
                <div className="flex gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setDetailEvent(e)}
                    className="bg-white/90 hover:bg-white text-foreground"
                  >
                    자세히 보기
                  </Button>
                  {e.linkUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={e.linkUrl} target="_blank" rel="noopener" className="border-white/80 text-white hover:bg-white/20">
                        바로가기
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {events.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full"
              onClick={goPrev}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full"
              onClick={goNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {events.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-6 bg-white" : "w-2 bg-white/50"
                  }`}
                  aria-label={`${i + 1}번 슬라이드`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <Dialog open={!!detailEvent} onOpenChange={() => setDetailEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{detailEvent?.name}</DialogTitle>
          </DialogHeader>
          {detailEvent && (
            <div className="space-y-4">
              {detailEvent.imageUrl && (
                <img
                  src={detailEvent.imageUrl}
                  alt={detailEvent.name}
                  className="w-full rounded-lg"
                />
              )}
              <p className="text-muted-foreground whitespace-pre-wrap">
                {detailEvent.description || "설명이 없습니다."}
              </p>
              {detailEvent.linkUrl && (
                <Button asChild>
                  <Link href={detailEvent.linkUrl} target="_blank" rel="noopener">
                    바로가기
                  </Link>
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
