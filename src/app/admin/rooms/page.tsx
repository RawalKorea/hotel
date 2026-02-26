import { AdminHeader } from "@/components/admin/admin-header";
import { prisma } from "@/lib/prisma";
import { RoomList } from "@/components/admin/room-list";

export const dynamic = "force-dynamic";

export default async function AdminRoomsPage() {
  let rooms;
  try {
    rooms = await prisma.room.findMany({
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    rooms = [];
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
