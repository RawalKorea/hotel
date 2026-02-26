"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Brain,
  FileText,
  HelpCircle,
  Settings,
  Plus,
  Trash2,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type DocumentData = {
  id: string;
  title: string;
  content: string;
  status: string;
  createdAt: Date;
};

type FAQData = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  isActive: boolean;
};

type SettingsData = {
  id: string;
  toneManner: string;
  greeting: string;
  systemPrompt: string;
} | null;

export function AIManager({
  initialDocuments,
  initialFaqEntries,
  initialSettings,
}: {
  initialDocuments: DocumentData[];
  initialFaqEntries: FAQData[];
  initialSettings: SettingsData;
}) {
  const [documents] = useState(initialDocuments);
  const [faqEntries, setFaqEntries] = useState(initialFaqEntries);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: "", answer: "", category: "" });
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    toneManner: initialSettings?.toneManner || "friendly",
    greeting: initialSettings?.greeting || "안녕하세요! 무엇을 도와드릴까요?",
    systemPrompt:
      initialSettings?.systemPrompt ||
      "당신은 호텔 고객 상담 AI 어시스턴트입니다. 친절하고 전문적으로 답변해주세요.",
  });

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/ai/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error();
      toast.success("설정이 저장되었습니다.");
    } catch {
      toast.error("설정 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFaq = async () => {
    if (!newFaq.question || !newFaq.answer) return;

    try {
      const res = await fetch("/api/admin/ai/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newFaq),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setFaqEntries([...faqEntries, created]);
      setNewFaq({ question: "", answer: "", category: "" });
      setFaqDialogOpen(false);
      toast.success("FAQ가 추가되었습니다.");
    } catch {
      toast.error("FAQ 추가 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteFaq = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/ai/faq/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setFaqEntries(faqEntries.filter((f) => f.id !== id));
      toast.success("FAQ가 삭제되었습니다.");
    } catch {
      toast.error("FAQ 삭제 중 오류가 발생했습니다.");
    }
  };

  const statusLabel: Record<string, string> = {
    PENDING: "대기",
    PROCESSING: "처리중",
    INDEXED: "완료",
    FAILED: "실패",
  };

  return (
    <Tabs defaultValue="settings" className="space-y-6">
      <TabsList>
        <TabsTrigger value="settings" className="gap-2">
          <Settings className="h-4 w-4" />
          챗봇 설정
        </TabsTrigger>
        <TabsTrigger value="faq" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          FAQ 관리
        </TabsTrigger>
        <TabsTrigger value="documents" className="gap-2">
          <FileText className="h-4 w-4" />
          학습 데이터
        </TabsTrigger>
      </TabsList>

      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              챗봇 설정
            </CardTitle>
            <CardDescription>
              AI 챗봇의 성격과 응답 스타일을 설정합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>톤앤매너</Label>
              <Input
                value={settings.toneManner}
                onChange={(e) =>
                  setSettings({ ...settings, toneManner: e.target.value })
                }
                placeholder="예: friendly, professional, casual"
              />
            </div>
            <div className="space-y-2">
              <Label>인사말</Label>
              <Input
                value={settings.greeting}
                onChange={(e) =>
                  setSettings({ ...settings, greeting: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>시스템 프롬프트</Label>
              <Textarea
                value={settings.systemPrompt}
                onChange={(e) =>
                  setSettings({ ...settings, systemPrompt: e.target.value })
                }
                rows={5}
              />
            </div>
            <Button onClick={handleSaveSettings} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              설정 저장
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="faq">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>FAQ 관리</CardTitle>
              <CardDescription>
                자주 묻는 질문과 답변을 등록하세요.
              </CardDescription>
            </div>
            <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  FAQ 추가
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>새 FAQ 추가</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>카테고리</Label>
                    <Input
                      value={newFaq.category}
                      onChange={(e) =>
                        setNewFaq({ ...newFaq, category: e.target.value })
                      }
                      placeholder="예: 예약, 시설, 요금"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>질문</Label>
                    <Input
                      value={newFaq.question}
                      onChange={(e) =>
                        setNewFaq({ ...newFaq, question: e.target.value })
                      }
                      placeholder="질문을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>답변</Label>
                    <Textarea
                      value={newFaq.answer}
                      onChange={(e) =>
                        setNewFaq({ ...newFaq, answer: e.target.value })
                      }
                      rows={4}
                      placeholder="답변을 입력하세요"
                    />
                  </div>
                  <Button className="w-full" onClick={handleAddFaq}>
                    추가하기
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>카테고리</TableHead>
                  <TableHead>질문</TableHead>
                  <TableHead>답변</TableHead>
                  <TableHead className="w-16">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faqEntries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-32 text-center text-muted-foreground"
                    >
                      등록된 FAQ가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  faqEntries.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell>
                        <Badge variant="outline">
                          {faq.category || "일반"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {faq.question}
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-muted-foreground">
                        {faq.answer}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteFaq(faq.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="documents">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>학습 데이터</CardTitle>
              <CardDescription>
                AI에게 학습시킬 호텔 매뉴얼, FAQ, 리뷰 등을 업로드하세요.
              </CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              문서 업로드
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>제목</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>등록일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-32 text-center text-muted-foreground"
                    >
                      등록된 학습 데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        {doc.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {statusLabel[doc.status] || doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(doc.createdAt), "yyyy.MM.dd")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
