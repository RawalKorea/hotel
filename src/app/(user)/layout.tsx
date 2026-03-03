import { SiteHeader } from "@/components/user/site-header";
import { SiteFooter } from "@/components/user/site-footer";
import { ChatWidget } from "@/components/user/chat-widget";
import { MessagePanel } from "@/components/user/message-panel";

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
      <MessagePanel />
    </div>
  );
}
