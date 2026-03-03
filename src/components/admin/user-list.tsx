"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { USER_ROLES } from "@/lib/constants";
import { Search, ChevronLeft, ChevronRight, User, Ban, Clock, Trash2 } from "lucide-react";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { toast } from "sonner";

type UserItem = {
  id: string;
  name: string | null;
  email: string | null;
  username: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  _count?: { bookings: number; reviews: number };
};

export function UserList() {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [detailUser, setDetailUser] = useState<UserItem | null>(null);
  const [banModal, setBanModal] = useState<UserItem | null>(null);
  const [banReason, setBanReason] = useState("");
  const [suspendModal, setSuspendModal] = useState<UserItem | null>(null);
  const [suspendUntil, setSuspendUntil] = useState("");
  const [suspendReason, setSuspendReason] = useState("");
  const [userDetail, setUserDetail] = useState<{
    bookings: unknown[];
    _count: { bookings: number; reviews: number; inquiries: number };
  } | null>(null);

  const totalPages = Math.ceil(total / 20);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
      });
      const res = await fetch(`/api/admin/users?${params}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUsers(data.users);
      setTotal(data.total);
    } catch {
      toast.error("고객 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error();
      toast.success("역할이 변경되었습니다.");
      fetchUsers();
    } catch {
      toast.error("역할 변경에 실패했습니다.");
    }
  };

  const handleBan = async () => {
    if (!banModal) return;
    try {
      const res = await fetch(`/api/admin/users/${banModal.id}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: banReason }),
      });
      if (!res.ok) throw new Error();
      toast.success("밴 처리되었습니다.");
      setBanModal(null);
      setBanReason("");
      fetchUsers();
    } catch {
      toast.error("밴 처리에 실패했습니다.");
    }
  };

  const handleSuspend = async () => {
    if (!suspendModal || !suspendUntil) {
      toast.error("정지 종료일을 입력하세요.");
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${suspendModal.id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ until: suspendUntil, reason: suspendReason }),
      });
      if (!res.ok) throw new Error();
      toast.success("정지 처리되었습니다.");
      setSuspendModal(null);
      setSuspendUntil("");
      setSuspendReason("");
      fetchUsers();
    } catch {
      toast.error("정지 처리에 실패했습니다.");
    }
  };

  const handleDeleteUser = async (u: UserItem) => {
    if (!confirm(`정말 ${u.name || "이 사용자"}를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) return;
    try {
      const res = await fetch(`/api/admin/users/${u.id}/delete`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("계정이 삭제되었습니다.");
      fetchUsers();
      setDetailUser(null);
    } catch {
      toast.error("삭제에 실패했습니다.");
    }
  };

  const openDetail = async (u: UserItem) => {
    setDetailUser(u);
    try {
      const res = await fetch(`/api/admin/users/${u.id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUserDetail({
        bookings: data.bookings || [],
        _count: data._count || { bookings: 0, reviews: 0, inquiries: 0 },
      });
    } catch {
      toast.error("상세 정보를 불러오는데 실패했습니다.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="이름, 이메일, 아이디, 전화번호 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="역할" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">전체</SelectItem>
              {Object.entries(USER_ROLES).map(([k, v]) => (
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
                <TableHead>이메일/아이디</TableHead>
                <TableHead>전화번호</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>예약/리뷰</TableHead>
                <TableHead>가입일</TableHead>
                <TableHead className="w-24">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    등록된 고객이 없습니다.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <button
                        onClick={() => openDetail(u)}
                        className="font-medium hover:underline text-left"
                      >
                        {u.name || "-"}
                      </button>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {u.email || u.username || "-"}
                      </span>
                    </TableCell>
                    <TableCell>{u.phone || "-"}</TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(v) => handleRoleChange(u.id, v)}
                      >
                        <SelectTrigger className="w-28 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(USER_ROLES).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        예약 {u._count?.bookings ?? 0} / 리뷰 {u._count?.reviews ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetail(u)}
                          title="상세"
                        >
                          <User className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setBanModal(u)}
                          title="밴"
                          className="text-destructive"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSuspendModal(u)}
                          title="정지"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(u)}
                          title="삭제"
                          className="text-destructive"
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

      <Dialog open={!!detailUser} onOpenChange={() => setDetailUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {detailUser?.name || "고객"} 상세
            </DialogTitle>
          </DialogHeader>
          {detailUser && userDetail && (
            <div className="space-y-3 text-sm">
              <p><strong>이메일:</strong> {detailUser.email || "-"}</p>
              <p><strong>아이디:</strong> {detailUser.username || "-"}</p>
              <p><strong>전화:</strong> {detailUser.phone || "-"}</p>
              <p><strong>예약:</strong> {userDetail._count.bookings}건</p>
              <p><strong>리뷰:</strong> {userDetail._count.reviews}건</p>
              <p><strong>문의:</strong> {userDetail._count.inquiries}건</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!banModal} onOpenChange={() => { setBanModal(null); setBanReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 밴</DialogTitle>
          </DialogHeader>
          {banModal && (
            <div className="space-y-4">
              <p className="text-sm">&quot;{banModal.name || banModal.email}&quot; 사용자를 밴하시겠습니까?</p>
              <Input
                placeholder="사유 (선택)"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleBan}>밴하기</Button>
                <Button variant="outline" onClick={() => setBanModal(null)}>취소</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!suspendModal} onOpenChange={() => { setSuspendModal(null); setSuspendUntil(""); setSuspendReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>사용자 정지</DialogTitle>
          </DialogHeader>
          {suspendModal && (
            <div className="space-y-4">
              <p className="text-sm">&quot;{suspendModal.name || suspendModal.email}&quot; 정지 기간을 설정하세요.</p>
              <div>
                <label className="text-sm font-medium block mb-1">정지 종료일 *</label>
                <Input
                  type="datetime-local"
                  value={suspendUntil}
                  onChange={(e) => setSuspendUntil(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">사유 (선택)</label>
                <Input
                  placeholder="사유"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleSuspend}>정지하기</Button>
                <Button variant="outline" onClick={() => setSuspendModal(null)}>취소</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
