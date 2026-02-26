"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  ROOM_GRADES,
  ROOM_STATUS,
  formatPrice,
} from "@/lib/constants";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { RoomForm } from "./room-form";

type RoomItem = {
  id: string;
  name: string;
  grade: string;
  pricePerNight: number;
  maxAdults: number;
  maxChildren: number;
  status: string;
  amenities: string[];
  images: { id: string; url: string }[];
};

export function RoomList({ initialRooms }: { initialRooms: RoomItem[] }) {
  const router = useRouter();
  const [rooms, setRooms] = useState(initialRooms);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<RoomItem | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/rooms/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setRooms(rooms.filter((r) => r.id !== deleteId));
      toast.success("객실이 삭제되었습니다.");
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleteId(null);
    }
  };

  const handleSuccess = () => {
    setFormOpen(false);
    setEditRoom(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            총 <span className="font-semibold text-foreground">{rooms.length}</span>개의 객실
          </p>
        </div>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditRoom(null)}>
              <Plus className="mr-2 h-4 w-4" />
              객실 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <RoomForm room={editRoom} onSuccess={handleSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">이미지</TableHead>
              <TableHead>객실명</TableHead>
              <TableHead>등급</TableHead>
              <TableHead>가격/박</TableHead>
              <TableHead>수용 인원</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  등록된 객실이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell>
                    {room.images[0] ? (
                      <img
                        src={room.images[0].url}
                        alt={room.name}
                        className="h-10 w-14 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-14 items-center justify-center rounded bg-muted">
                        <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{room.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {ROOM_GRADES[room.grade as keyof typeof ROOM_GRADES]}
                    </Badge>
                  </TableCell>
                  <TableCell>₩{formatPrice(room.pricePerNight)}</TableCell>
                  <TableCell>
                    성인 {room.maxAdults} / 아동 {room.maxChildren}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={room.status === "AVAILABLE" ? "default" : "secondary"}
                    >
                      {ROOM_STATUS[room.status as keyof typeof ROOM_STATUS]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditRoom(room);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(room.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>객실을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 관련된 예약과 리뷰도 함께 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
