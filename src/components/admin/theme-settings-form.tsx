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
import { Palette } from "lucide-react";

const THEME_OPTIONS = [
  { value: "blue", label: "블루" },
  { value: "green", label: "그린" },
  { value: "violet", label: "바이올렛" },
  { value: "orange", label: "오렌지" },
  { value: "red", label: "레드" },
  { value: "slate", label: "슬레이트" },
] as const;

const CORNER_OPTIONS = [
  { value: "sharp", label: "각지게" },
  { value: "rounded", label: "둥글게" },
] as const;

export function ThemeSettingsForm() {
  const [theme, setTheme] = useState("blue");
  const [cornerStyle, setCornerStyle] = useState("rounded");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTheme(data.themeColor || "blue");
        setCornerStyle(data.cornerStyle || "rounded");
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
        body: JSON.stringify({
          themeColor: theme,
          cornerStyle,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("테마 설정이 저장되었습니다. 새로고침 후 적용됩니다.");
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
        <div className="min-h-[120px]" />
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          색깔 테마 & 모서리 스타일
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          사이트 전역 색상 테마와 카드/버튼 모서리 스타일을 설정합니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>색상 테마</Label>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-48 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEME_OPTIONS.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>모서리 스타일</Label>
          <Select value={cornerStyle} onValueChange={setCornerStyle}>
            <SelectTrigger className="w-48 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CORNER_OPTIONS.map(({ value, label }) => (
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
