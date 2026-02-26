"use client";

import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function AdminHeader({ title }: { title: string }) {
  const { data: session } = useSession();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="text-xs">
          {session?.user?.role === "SUPER_ADMIN" ? "Super Admin" : "Staff"}
        </Badge>
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback>
              {session?.user?.name?.charAt(0) || "A"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">{session?.user?.name}</span>
        </div>
      </div>
    </header>
  );
}
