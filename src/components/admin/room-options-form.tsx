"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { BedDouble } from "lucide-react";
import { AMENITIES_OPTIONS } from "@/lib/constants";

export function RoomOptionsForm() {
  const [defaultAmenities, setDefaultAmenities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) throw new Error();
        const data = await res.json();
        const raw = data.defaultRoomAmenities;
        setDefaultAmenities(
          typeof raw === "string"
            ? raw
              ? JSON.parse(raw)
              : []
            : Array.isArray(raw)
              ? raw
              : []
        );
      } catch {
        setDefaultAmenities([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const toggleAmenity = (a: string) => {
    setDefaultAmenities((prev) =>
      prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const current = await fetch("/api/admin/settings").then((r) => r.json());
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...current,
          defaultRoomAmenities: JSON.stringify(defaultAmenities),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("기초 방 옵션이 저장되었습니다. 각 방 설정에서 개별 수정 가능합니다.");
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
          <BedDouble className="h-5 w-5" />
          기초 방 옵션 (기본값)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          새 객실 등록 시 기본 적용될 옵션입니다. 전부 아님 선택 시 빈 배열. 각 방 설정에서 개별 수정 가능.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {AMENITIES_OPTIONS.map((a) => (
            <div key={a} className="flex items-center gap-2">
              <Checkbox
                id={`amenity-${a}`}
                checked={defaultAmenities.includes(a)}
                onCheckedChange={() => toggleAmenity(a)}
              />
              <Label htmlFor={`amenity-${a}`} className="text-sm font-normal cursor-pointer">
                {a}
              </Label>
            </div>
          ))}
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "저장 중..." : "저장"}
        </Button>
      </CardContent>
    </Card>
  );
}
