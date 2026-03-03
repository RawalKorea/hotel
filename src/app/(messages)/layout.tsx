import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, MessageCircle } from "lucide-react";

export default async function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* 독립 메시지 앱 헤더 - 메인 사이트와 분리 */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-card/80 backdrop-apple shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="hidden sm:inline">홈으로</span>
        </Link>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">메시지</span>
          </div>
        </div>
        <div className="w-16" />
      </header>
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>
    </div>
  );
}
