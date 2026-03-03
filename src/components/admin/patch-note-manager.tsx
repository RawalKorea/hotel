"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { GeminiSpinner } from "@/components/ui/gemini-spinner";
import { toast } from "sonner";

type PatchNoteItem = {
  id: string;
  version: string;
  title: string;
  content: string;
  createdAt: string;
};

export function PatchNoteManager() {
  const router = useRouter();
  const [notes, setNotes] = useState<PatchNoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editNote, setEditNote] = useState<PatchNoteItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({
    version: "",
    title: "",
    content: "",
  });

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/admin/patchnotes");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setNotes(data);
    } catch {
      toast.error("패치 노트를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const openForm = (note?: PatchNoteItem) => {
    if (note) {
      setEditNote(note);
      setForm({
        version: note.version,
        title: note.title,
        content: note.content,
      });
    } else {
      setEditNote(null);
      setForm({ version: "", title: "", content: "" });
    }
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.version.trim() || !form.title.trim() || !form.content.trim()) {
      toast.error("버전, 제목, 내용을 모두 입력하세요.");
      return;
    }
    try {
      if (editNote) {
        const res = await fetch(`/api/admin/patchnotes/${editNote.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast.success("패치 노트가 수정되었습니다.");
      } else {
        const res = await fetch("/api/admin/patchnotes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error();
        toast.success("패치 노트가 등록되었습니다.");
      }
      setFormOpen(false);
      fetchNotes();
      router.refresh();
    } catch {
      toast.error("저장 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/patchnotes/${deleteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setNotes(notes.filter((n) => n.id !== deleteId));
      toast.success("패치 노트가 삭제되었습니다.");
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground text-sm">
          수정 시마다 패치 노트에 추가하여 사용자와 관리자가 변경 사항을 확인할 수 있습니다.
        </p>
        <Button onClick={() => openForm()}>
          <Plus className="h-4 w-4 mr-2" />
          패치 노트 추가
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <GeminiSpinner className="h-8 w-8" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>버전</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead className="w-24">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    등록된 패치 노트가 없습니다. 추가해 주세요.
                  </TableCell>
                </TableRow>
              ) : (
                notes.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-mono font-medium">{n.version}</TableCell>
                    <TableCell>{n.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(n.createdAt).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openForm(n)}>
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
              {editNote ? "패치 노트 수정" : "패치 노트 추가"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">버전</label>
              <Input
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                placeholder="1.0.4"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">제목</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="고객 관리 기능 추가"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">내용</label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="변경 사항을 입력하세요"
                rows={6}
                required
              />
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
            <AlertDialogTitle>패치 노트 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
