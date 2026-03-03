"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { ShieldAlert, Users, Settings, Megaphone } from "lucide-react";

const COMMON_ITEMS = [
  { key: "enableUserBlock", label: "사용자 차단" },
  { key: "enableFriends", label: "친구 추가" },
  { key: "enableMessenger", label: "메신저" },
  { key: "enableGroupMessenger", label: "단체 메신저" },
  { key: "enableFamilySettings", label: "가족 설정" },
  { key: "allowDeleteOwnAccount", label: "본인 계정 삭제" },
] as const;

const ADMIN_ITEMS = [
  { key: "enablePartnersAccount", label: "파트너스 계정 설정" },
] as const;

export function DangerPermissionsForm() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/danger-settings");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setSettings(data);
      } catch {
        toast.error("설정을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = (key: string, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value ? "true" : "false" }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/danger-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success("위험 권한 설정이 저장되었습니다.");
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
        <div className="min-h-[300px]" />
      </>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            공용 (Common)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            모든 사용자가 이용할 수 있는 기능을 켜거나 끕니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {COMMON_ITEMS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key}>{label}</Label>
              <Switch
                id={key}
                checked={settings[key] === "true"}
                onCheckedChange={(v) => handleToggle(key, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            관리자 전용
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            관리자 기능 활성화 여부. (사용자 밴, 정지, 삭제, 권한 부여는 고객 관리에서 수행)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {ADMIN_ITEMS.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key}>{label}</Label>
              <Switch
                id={key}
                checked={settings[key] === "true"}
                onCheckedChange={(v) => handleToggle(key, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving}>
        {saving ? "저장 중..." : "설정 저장"}
      </Button>
    </div>
  );
}
