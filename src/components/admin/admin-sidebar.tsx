"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Hotel,
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  BarChart3,
  MessageSquare,
  Brain,
  Megaphone,
  Settings,
  LogOut,
  Users,
} from "lucide-react";

const navItems = [
  {
    title: "대시보드",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "객실 관리",
    href: "/admin/rooms",
    icon: BedDouble,
  },
  {
    title: "예약 관리",
    href: "/admin/bookings",
    icon: CalendarDays,
  },
  {
    title: "고객 관리",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "매출/통계",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "AI 엔진",
    href: "/admin/ai",
    icon: Brain,
  },
  {
    title: "고객 문의",
    href: "/admin/inquiries",
    icon: MessageSquare,
  },
  {
    title: "공지사항",
    href: "/admin/notices",
    icon: Megaphone,
  },
  {
    title: "설정",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Hotel className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none">StayNest</h1>
          <p className="text-xs text-muted-foreground">관리자 패널</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3",
                    isActive && "font-semibold"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          로그아웃
        </Button>
      </div>
    </div>
  );
}
