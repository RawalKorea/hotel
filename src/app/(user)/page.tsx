import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { prisma } from "@/lib/prisma";
import { ROOM_GRADES, formatPrice } from "@/lib/constants";
import {
  Search,
  Star,
  Shield,
  Headphones,
  ArrowRight,
  MapPin,
  CalendarDays,
  Users,
} from "lucide-react";
import { HeroWithEvent } from "@/components/user/hero-with-event";

export const dynamic = "force-dynamic";

async function getFeaturedRooms() {
  try {
    return await prisma.room.findMany({
      where: { status: "AVAILABLE" },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: { grade: "desc" },
      take: 4,
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredRooms = await getFeaturedRooms();

  const features = [
    {
      icon: Search,
      title: "스마트 검색",
      desc: "날짜, 인원, 예산에 맞는 완벽한 객실을 찾아보세요.",
    },
    {
      icon: Shield,
      title: "안전한 결제",
      desc: "검증된 결제 시스템으로 안심하고 예약하세요.",
    },
    {
      icon: Headphones,
      title: "AI 컨시어지",
      desc: "24시간 AI 챗봇이 모든 문의에 답변합니다.",
    },
    {
      icon: Star,
      title: "프리미엄 서비스",
      desc: "세심한 서비스로 특별한 투숙 경험을 제공합니다.",
    },
  ];

  return (
    <>
      {/* Hero: 이벤트 배경 + 객실·인원 검색 */}
      <HeroWithEvent />

      {/* Features */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold">왜 StayNest인가요?</h2>
            <p className="text-muted-foreground">
              고객 만족을 위한 차별화된 서비스를 경험하세요.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card
                key={feature.title}
                className="text-center border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="mb-3 text-3xl font-bold">추천 객실</h2>
              <p className="text-muted-foreground">
                엄선된 프리미엄 객실을 만나보세요.
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/rooms">
                전체 보기
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredRooms.map((room) => (
              <Link key={room.id} href={`/rooms/${room.id}`}>
                <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all">
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
                  <CardContent className="p-4">
                    <Badge variant="outline" className="mb-2">
                      {ROOM_GRADES[room.grade as keyof typeof ROOM_GRADES]}
                    </Badge>
                    <h3 className="mb-1 font-semibold group-hover:text-primary transition-colors">
                      {room.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        최대 {room.maxAdults + room.maxChildren}명
                      </span>
                    </div>
                    <p className="text-lg font-bold">
                      ₩{formatPrice(room.pricePerNight)}
                      <span className="text-sm font-normal text-muted-foreground">
                        /박
                      </span>
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {featuredRooms.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <CalendarDays className="mx-auto mb-4 h-12 w-12" />
              <p className="text-lg">아직 등록된 객실이 없습니다.</p>
              <p className="text-sm">곧 멋진 객실들이 준비됩니다!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold">
            지금 바로 예약하세요
          </h2>
          <p className="mb-8 text-muted-foreground">
            특별한 가격으로 최고의 객실을 만나보세요.
          </p>
          <Button size="lg" asChild>
            <Link href="/rooms">
              객실 둘러보기
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
