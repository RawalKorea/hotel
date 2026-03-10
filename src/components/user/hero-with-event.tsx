"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchBar } from "@/components/user/search-bar";
import { cn } from "@/lib/utils";

type EventItem = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
};

function EventContent({
  event,
  onClick,
}: {
  event: EventItem;
  onClick: () => void;
}) {
  const hasLink = !!event.linkUrl;
  const content = (
    <>
      <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-6xl">
        {event.name}
      </h1>
      {event.description && (
        <p className="mb-8 text-lg text-slate-200 md:text-xl max-w-2xl mx-auto">
          {event.description}
        </p>
      )}
      {hasLink && (
        <span className="inline-block text-sm text-cyan-400 hover:text-cyan-300 underline cursor-pointer">
          자세히 보기 →
        </span>
      )}
    </>
  );
  if (hasLink) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg"
      >
        {content}
      </button>
    );
  }
  return <div>{content}</div>;
}

export function HeroWithEvent() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [index, setIndex] = useState(0);
  const [carouselMode, setCarouselMode] = useState<"swipe" | "smooth">("smooth");

  useEffect(() => {
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]));
  }, []);

  useEffect(() => {
    fetch("/api/settings/theme")
      .then((r) => r.json())
      .then((d) => setCarouselMode(d.eventCarouselMode === "swipe" ? "swipe" : "smooth"))
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

  const hasEvents = events.length > 0;
  const isSwipe = carouselMode === "swipe";

  return (
    <section className="relative overflow-hidden min-h-[520px] md:min-h-[580px]">
      {/* 배경: 이벤트 캐러셀 또는 그라데이션 */}
      <div className="absolute inset-0">
        {hasEvents ? (
          <div
            className={cn(
              "absolute inset-0",
              isSwipe && "flex"
            )}
          >
            {isSwipe ? (
              <div
                className="flex w-full h-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${index * 100}%)` }}
              >
                {events.map((e) => (
                  <div key={e.id} className="min-w-full h-full flex-shrink-0">
                    {e.imageUrl ? (
                      <img
                        src={e.imageUrl}
                        alt={e.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              events.map((e, i) => (
                <div
                  key={e.id}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-500",
                    i === index ? "opacity-100 z-0" : "opacity-0"
                  )}
                >
                  {e.imageUrl ? (
                    <img
                      src={e.imageUrl}
                      alt={e.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
        )}
      </div>

      {/* 어두운 오버레이 - 텍스트·검색바 가독용 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 z-[1]" />

      {/* 이벤트 네비게이션 (이벤트 있을 때만) */}
      {hasEvents && events.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-[2] bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={goPrev}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-[2] bg-black/30 hover:bg-black/50 text-white rounded-full"
            onClick={goNext}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[2] flex gap-2">
            {events.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index ? "w-6 bg-white" : "w-2 bg-white/50"
                )}
                aria-label={`${i + 1}번 슬라이드`}
              />
            ))}
          </div>
        </>
      )}

      {/* 상단: 이벤트 이름·설명 (이벤트 있으면) 또는 배지 */}
      <div className="relative z-[2] container mx-auto px-4 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center mb-8">
          {hasEvents ? (
            <EventContent
              event={events[index]}
              onClick={() => {
                const url = events[index].linkUrl;
                if (url) {
                  if (url.startsWith("http")) {
                    window.open(url, "_blank");
                  } else {
                    router.push(url);
                  }
                }
              }}
            />
          ) : (
            <>
              <Badge className="mb-4" variant="secondary">
                <Sparkles className="mr-1 h-3 w-3" />
                AI 기반 스마트 호텔
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-white md:text-6xl">
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  StayNest
                </span>
              </h1>
              <p className="mb-8 text-lg text-slate-200 md:text-xl">
                AI 컨시어지가 24시간 최상의 서비스를 제공합니다.
              </p>
            </>
          )}
        </div>

        {/* 날짜·인원 검색 (이벤트 밑) */}
        <div className="mx-auto max-w-4xl">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
