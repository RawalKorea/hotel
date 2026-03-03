"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { Plus, Pencil, Trash2, Megaphone, Upload, X } from "lucide-react";

type EventItem = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  startAt: string | null;
  endAt: string | null;
};

export function EventManager() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editEvent, setEditEvent] = useState<EventItem | null | "new">(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    linkUrl: "",
    sortOrder: 0,
    isActive: true,
  });
  const [imageUploading, setImageUploading] = useState(false);

  const fetchEvents = async () => {
    try {
      const res = await fetch("/api/admin/events?admin=true");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setEvents(data);
    } catch {
      toast.error("이벤트 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const openForm = (e?: EventItem) => {
    if (e) {
      setEditEvent(e);
      setForm({
        name: e.name,
        description: e.description || "",
        imageUrl: e.imageUrl || "",
        linkUrl: e.linkUrl || "",
        sortOrder: e.sortOrder,
        isActive: e.isActive,
      });
    } else {
      setEditEvent("new");
      setForm({
        name: "",
        description: "",
        imageUrl: "",
        linkUrl: "",
        sortOrder: events.length,
        isActive: true,
      });
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("이름을 입력하세요.");
      return;
    }
    try {
      if (editEvent && editEvent !== "new") {
        const res = await fetch(`/api/admin/events/${editEvent.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            description: form.description || null,
            imageUrl: form.imageUrl || null,
            linkUrl: form.linkUrl || null,
            sortOrder: form.sortOrder,
            isActive: form.isActive,
          }),
        });
        if (!res.ok) throw new Error();
        toast.success("이벤트가 수정되었습니다.");
      } else {
        const res = await fetch("/api/admin/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            description: form.description || null,
            imageUrl: form.imageUrl || null,
            linkUrl: form.linkUrl || null,
          }),
        });
        if (!res.ok) throw new Error();
        toast.success("이벤트가 등록되었습니다.");
      }
      setEditEvent(null);
      fetchEvents();
    } catch {
      toast.error("저장 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 이벤트를 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("이벤트가 삭제되었습니다.");
      fetchEvents();
      if (editEvent && editEvent !== "new" && editEvent.id === id) setEditEvent(null);
    } catch {
      toast.error("삭제 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <>
        <LoadingOverlay />
        <div className="min-h-[200px]" />
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Megaphone className="h-5 w-5" />
            메인 화면 이벤트
          </CardTitle>
          <Button onClick={() => openForm()}>
            <Plus className="mr-2 h-4 w-4" />
            추가
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          이미지, 이름, 자세히 보기(설명) 설정. 여러 개 시 시간에 따라 자동 넘어감.
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {events.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">등록된 이벤트가 없습니다.</p>
        ) : (
          events.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3">
                {e.imageUrl && (
                  <img
                    src={e.imageUrl}
                    alt={e.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                )}
                <div>
                  <p className="font-medium">{e.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.isActive ? "활성" : "비활성"} · 순서 {e.sortOrder}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => openForm(e)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleDelete(e.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>

      <Dialog open={!!editEvent} onOpenChange={(open) => !open && setEditEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editEvent === "new" ? "이벤트 추가" : "이벤트 수정"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ename">이름</Label>
              <Input
                id="ename"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="이벤트 이름"
              />
            </div>
            <div>
              <Label htmlFor="edesc">설명 (자세히 보기)</Label>
              <Textarea
                id="edesc"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="자세히 보기 내용"
                rows={2}
              />
            </div>
            <div>
              <Label>이미지</Label>
              <div className="flex gap-2 items-center mt-1">
                <input
                  id="eimg-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setImageUploading(true);
                    try {
                      const fd = new FormData();
                      fd.append("file", file);
                      const res = await fetch("/api/admin/events/upload", {
                        method: "POST",
                        body: fd,
                      });
                      if (!res.ok) {
                        const err = await res.json();
                        throw new Error(err.error);
                      }
                      const data = await res.json();
                      setForm((p) => ({ ...p, imageUrl: data.fileUrl }));
                      toast.success("이미지가 업로드되었습니다.");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "업로드 실패");
                    } finally {
                      setImageUploading(false);
                      e.target.value = "";
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("eimg-upload")?.click()}
                  disabled={imageUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {imageUploading ? "업로드 중..." : "컴퓨터에서 선택"}
                </Button>
                {form.imageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setForm((p) => ({ ...p, imageUrl: "" }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {form.imageUrl && (
                <div className="mt-2">
                  <img
                    src={form.imageUrl}
                    alt="미리보기"
                    className="h-24 rounded-lg object-cover border"
                  />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="elink">링크 URL (클릭 시 이동)</Label>
              <Input
                id="elink"
                value={form.linkUrl}
                onChange={(e) => setForm((p) => ({ ...p, linkUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="eorder">순서</Label>
              <Input
                id="eorder"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((p) => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="eactive">활성</Label>
              <Switch
                id="eactive"
                checked={form.isActive}
                onCheckedChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
              />
            </div>
            <Button onClick={handleSave}>저장</Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
