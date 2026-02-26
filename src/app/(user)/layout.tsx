import { SiteHeader } from "@/components/user/site-header";
import { SiteFooter } from "@/components/user/site-footer";
import { ChatWidget } from "@/components/user/chat-widget";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <ChatWidget />
    </div>
  );
}
