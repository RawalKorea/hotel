import { MessagesApp } from "@/components/user/messages-app";

export const dynamic = "force-dynamic";

export default function MessagesPage() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <MessagesApp />
    </div>
  );
}
