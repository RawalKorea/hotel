"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { GeminiSpinner } from "@/components/ui/gemini-spinner";

const SETTINGS_FIELDS: Array<{
  key: string;
  label: string;
  placeholder: string;
  textarea?: boolean;
}> = [
  { key: "siteName", label: "사이트 이름", placeholder: "StayNest" },
  { key: "siteDescription", label: "사이트 설명", placeholder: "AI 기반 호텔 예약 시스템", textarea: true },
  { key: "contactEmail", label: "문의 이메일", placeholder: "contact@staynest.com" },
  { key: "contactPhone", label: "문의 전화", placeholder: "02-1234-5678" },
  { key: "address", label: "주소", placeholder: "서울시 강남구 ..." },
  { key: "businessHours", label: "운영시간", placeholder: "24시간" },
  { key: "checkInTime", label: "체크인 시간", placeholder: "15:00" },
  { key: "checkOutTime", label: "체크아웃 시간", placeholder: "11:00" },
  { key: "cancellationPolicy", label: "취소 정책", placeholder: "체크인 1일 전까지 무료 취소", textarea: true },
  { key: "footerText", label: "푸터 문구", placeholder: "© 2024 StayNest. All rights reserved.", textarea: true },
  { key: "aboutContent", label: "호텔 소개 페이지", placeholder: "## 호텔 소개\n\n내용을 입력하세요...", textarea: true },
  { key: "faqContent", label: "자주 묻는 질문 (Q: 질문\nA: 답변 형식)", placeholder: "Q: 질문1\nA: 답변1\n\nQ: 질문2\nA: 답변2", textarea: true },
  { key: "termsContent", label: "이용약관 페이지", placeholder: "이용약관 내용...", textarea: true },
  { key: "privacyContent", label: "개인정보 처리방침 페이지", placeholder: "개인정보 처리방침 내용...", textarea: true },
];

export function SettingsForm() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
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

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success("설정이 저장되었습니다.");
    } catch {
      toast.error("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center py-12">
          <GeminiSpinner className="h-8 w-8" />
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>사이트 기본 설정</CardTitle>
          <p className="text-sm text-muted-foreground">
            전역 사이트 설정을 관리합니다. 최고관리자만 수정할 수 있습니다.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {SETTINGS_FIELDS.map(({ key, label, placeholder, textarea }) => (
            <div key={key}>
              <label className="text-sm font-medium mb-2 block">{label}</label>
              {textarea ? (
                <Textarea
                  value={settings[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  rows={key === "siteDescription" || key === "cancellationPolicy" || key === "footerText" ? 2 : 6}
                />
              ) : (
                <Input
                  value={settings[key] || ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                />
              )}
            </div>
          ))}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "저장 중..." : "설정 저장"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
