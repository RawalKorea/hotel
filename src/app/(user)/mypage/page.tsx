import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, Star, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [bookingCount, reviewCount] = await Promise.all([
    prisma.booking.count({ where: { userId: session.user.id } }),
    prisma.review.count({ where: { userId: session.user.id } }),
  ]);

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true, image: true, createdAt: true },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">마이페이지</h1>

      <Card className="mb-6">
        <CardContent className="flex items-center gap-6 p-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={session.user.image || ""} />
            <AvatarFallback className="text-2xl">
              {session.user.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{user?.name || "이름 없음"}</h2>
            <p className="text-muted-foreground">{user?.email}</p>
            {user?.phone && (
              <p className="text-sm text-muted-foreground">{user.phone}</p>
            )}
            <Badge variant="outline" className="mt-2">
              {session.user.role === "SUPER_ADMIN"
                ? "관리자"
                : session.user.role === "STAFF"
                  ? "스태프"
                  : "일반 회원"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/mypage/bookings">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                예약 내역
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{bookingCount}건</p>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="h-5 w-5 text-yellow-500" />
              작성한 리뷰
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{reviewCount}건</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-5 w-5 text-green-600" />
              프로필 관리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" size="sm" asChild>
              <Link href="/mypage/profile">수정하기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
