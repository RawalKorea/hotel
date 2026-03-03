"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { INQUIRY_STATUS, INQUIRY_STATUS_COLOR } from "@/lib/constants";
import { Search, ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { toast } from "sonner";

type InquiryItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  content: string;
  status: string;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
  user?: { name: string | null; email: string | null };
};

export function InquiryList() {
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [detailInquiry, setDetailInquiry] = useState<InquiryItem | null>(null);
  const [replyText, setReplyText] = useState("");

  const totalPages = Math.ceil(total / 20);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
      });
      const res = await fetch(`/api/admin/inquiries?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInquiries(data.inquiries);
      setTotal(data.total);
    } catch {
      toast.error("문의 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, [page, search, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInquiries();
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success("상태가 변경되었습니다.");
      fetchInquiries();
      if (detailInquiry?.id === id) {
        setDetailInquiry({ ...detailInquiry, status });
      }
    } catch {
      toast.error("상태 변경에 실패했습니다.");
    }
  };

  const handleReply = async () => {
    if (!detailInquiry) return;
    try {
      const res = await fetch(`/api/admin/inquiries/${detailInquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText, status: "RESOLVED" }),
      });
      if (!res.ok) throw new Error();
      toast.success("답변이 등록되었습니다.");
      setDetailInquiry(null);
      setReplyText("");
      fetchInquiries();
    } catch {
      toast.error("답변 등록에 실패했습니다.");
    }
  };

  const openDetail = (inq: InquiryItem) => {
    setDetailInquiry(inq);
    setReplyText(inq.reply || "");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="이름, 이메일, 제목 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체</SelectItem>
              {Object.entries(INQUIRY_STATUS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit">검색</Button>
        </form>
      </div>

      <div className="rounded-lg border bg-card">
        {loading ? (
          <>
            <LoadingOverlay />
            <div className="min-h-[200px]" />
          </>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>이메일</TableHead>
                <TableHead>제목</TableHead>
                <TableHead>상태</TableHead>
                <TableHead>등록일</TableHead>
                <TableHead className="w-24">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    등록된 문의가 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                inquiries.map((inq) => (
                  <TableRow key={inq.id}>
                    <TableCell>{inq.name}</TableCell>
                    <TableCell className="text-sm">{inq.email}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => openDetail(inq)}
                        className="text-left hover:underline line-clamp-1 max-w-48"
                      >
                        {inq.subject}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={
                          INQUIRY_STATUS_COLOR[inq.status] ||
                          "bg-gray-100 text-gray-800"
                        }
                      >
                        {INQUIRY_STATUS[inq.status as keyof typeof INQUIRY_STATUS] || inq.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(inq.createdAt).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetail(inq)}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={!!detailInquiry} onOpenChange={() => setDetailInquiry(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detailInquiry?.subject}</DialogTitle>
          </DialogHeader>
          {detailInquiry && (
            <div className="space-y-4">
              <div className="grid gap-2 text-sm">
                <p><strong>이름:</strong> {detailInquiry.name}</p>
                <p><strong>이메일:</strong> {detailInquiry.email}</p>
                <p><strong>전화:</strong> {detailInquiry.phone || "-"}</p>
                <p><strong>등록일:</strong> {new Date(detailInquiry.createdAt).toLocaleString("ko-KR")}</p>
                <div>
                  <strong>내용:</strong>
                  <p className="mt-1 p-3 bg-muted rounded-md whitespace-pre-wrap">
                    {detailInquiry.content}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">답변</label>
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="답변을 입력하세요"
                  rows={4}
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button onClick={handleReply}>답변 등록</Button>
                  <Select
                    value={detailInquiry.status}
                    onValueChange={(v) => handleStatusChange(detailInquiry.id, v)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(INQUIRY_STATUS).map(([k, v]) => (
                        <SelectItem key={k} value={k}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
