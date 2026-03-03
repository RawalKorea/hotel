"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

export function InquiryForm({ userId }: { userId?: string }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    content: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.content.trim()) {
      toast.error("이름, 이메일, 제목, 내용을 모두 입력하세요.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "문의 등록 실패");
      toast.success("문의가 등록되었습니다. 빠른 시일 내에 답변 드리겠습니다.");
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", subject: "", content: "" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "문의 등록에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-lg font-medium text-green-600 mb-2">문의가 성공적으로 접수되었습니다.</p>
            <p className="text-muted-foreground">
              입력하신 이메일로 빠른 시일 내에 답변을 드리겠습니다.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSubmitted(false)}
            >
              추가 문의하기
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {loading && <LoadingOverlay />}
    <Card>
      <CardHeader>
        <CardTitle>문의 양식</CardTitle>
        <p className="text-sm text-muted-foreground">
          * 표시는 필수 입력 항목입니다.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium mb-2 block">
                이름 <span className="text-destructive">*</span>
              </label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="홍길동"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                이메일 <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="example@email.com"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">전화번호</label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="010-1234-5678"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              제목 <span className="text-destructive">*</span>
            </label>
            <Input
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="문의 제목"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              내용 <span className="text-destructive">*</span>
            </label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="문의 내용을 자세히 입력해 주세요."
              rows={6}
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "전송 중..." : "문의 보내기"}
          </Button>
        </form>
      </CardContent>
    </Card>
    </>
  );
}
