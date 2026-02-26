import type { Prisma } from "@prisma/client";
import { AdminHeader } from "@/components/admin/admin-header";
import { prisma } from "@/lib/prisma";
import { RoomList } from "@/components/admin/room-list";

export const dynamic = "force-dynamic";

export default async function AdminRoomsPage() {
  type RoomWithImage = Prisma.RoomGetPayload<{
    include: { images: true };
  }>;
  let rooms: RoomWithImage[];
  try {
    rooms = await prisma.room.findMany({
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    rooms = [] as typeof rooms;
  }

  return (
    <>
      <AdminHeader title="객실 관리" />
      <div className="p-6">
        <RoomList initialRooms={rooms} />
      </div>
    </>
  );
}
