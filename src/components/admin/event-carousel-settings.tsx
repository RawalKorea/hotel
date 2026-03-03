"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { ImageIcon } from "lucide-react";

const TRANSITION_OPTIONS = [
  { value: "swipe", label: "스와이프 (화면 넘기기)" },
  { value: "smooth", label: "스르륵 (페이드 전환)" },
] as const;

export function EventCarouselSettings() {
  const [mode, setMode] = useState("smooth");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setMode(data.eventCarouselMode || "smooth");
      } catch {
        toast.error("설정을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventCarouselMode: mode }),
      });
      if (!res.ok) throw new Error();
      toast.success("이벤트 전환 모드가 저장되었습니다.");
    } catch {
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <LoadingOverlay />
        <div className="min-h-[80px]" />
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          이벤트 캐러셀 전환 모드
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          메인 화면 이벤트가 넘어가는 방식을 설정합니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>전환 방식</Label>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger className="w-64 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANSITION_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </Button>
      </CardContent>
    </Card>
  );
}
