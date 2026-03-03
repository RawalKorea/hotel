"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type NoticeItem = {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
};

export function NoticeList() {
  const router = useRouter();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editNotice, setEditNotice] = useState<NoticeItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    isActive: true,
    sortOrder: 0,
  });

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notices");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotices(data);
    } catch {
      toast.error("공지사항 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const openForm = (notice?: NoticeItem) => {
    if (notice) {
      setEditNotice(notice);
      setForm({
        title: notice.title,
        content: notice.content,
        isActive: notice.isActive,
        sortOrder: notice.sortOrder,
      });
    } else {
      setEditNotice(null);
      setForm({ title: "", content: "", isActive: true, sortOrder: 0 });
    }
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("제목과 내용을 입력하세요.");
      return;
    }
    try {
      if (editNotice) {
        const res = await fetch(`/api/admin/notices/${editNotice.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast.success("공지사항이 수정되었습니다.");
      } else {
        const res = await fetch("/api/admin/notices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast.success("공지사항이 등록되었습니다.");
      }
      setFormOpen(false);
      fetchNotices();
      router.refresh();
    } catch {
      toast.error("저장 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/notices/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setNotices(notices.filter((n) => n.id !== deleteId));
      toast.success("공지사항이 삭제되었습니다.");
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleteId(null);
    }
  };

  const toggleActive = async (notice: NoticeItem) => {
    try {
      const res = await fetch(`/api/admin/notices/${notice.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !notice.isActive }),
      });
      if (!res.ok) throw new Error();
      setNotices(
        notices.map((n) =>
          n.id === notice.id ? { ...n, isActive: !n.isActive } : n
        )
      );
      toast.success(notice.isActive ? "비공개로 변경되었습니다." : "공개로 변경되었습니다.");
    } catch {
      toast.error("변경에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => openForm()}>
          <Plus className="h-4 w-4 mr-2" />
          공지사항 등록
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>제목</TableHead>
                <TableHead>공개</TableHead>
                <TableHead>순서</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead className="w-24">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    등록된 공지사항이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                notices.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium">{n.title}</TableCell>
                    <TableCell>
                      <Switch
                        checked={n.isActive}
                        onCheckedChange={() => toggleActive(n)}
                      />
                    </TableCell>
                    <TableCell>{n.sortOrder}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(n.createdAt).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openForm(n)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(n.id)}
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
        )}
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editNotice ? "공지사항 수정" : "공지사항 등록"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">제목</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="제목"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">내용</label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="내용"
                rows={6}
                required
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                <label className="text-sm">공개</label>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm">순서</label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })
                  }
                  className="w-20"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                취소
              </Button>
              <Button type="submit">저장</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>공지사항 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
