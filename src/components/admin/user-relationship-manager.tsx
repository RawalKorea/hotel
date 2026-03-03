"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { UserPlus, Users, Heart, Briefcase, Trash2 } from "lucide-react";

const REL_TYPES = [
  { value: "FRIEND", label: "친구", icon: Users },
  { value: "FAMILY", label: "가족", icon: Heart },
  { value: "PARTNERS", label: "파트너스", icon: Briefcase },
] as const;

type RelItem = {
  id: string;
  targetId: string;
  type: string;
  target: { id: string; name: string | null; email: string | null; username: string | null };
};

type UserItem = { id: string; name: string | null; email: string | null; username: string | null };

export function UserRelationshipManager({ userId, userName }: { userId: string; userName: string }) {
  const [relationships, setRelationships] = useState<RelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [targetSearch, setTargetSearch] = useState("");
  const [targetUsers, setTargetUsers] = useState<UserItem[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [selectedType, setSelectedType] = useState<"FRIEND" | "FAMILY" | "PARTNERS">("FRIEND");

  const fetchRels = async () => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/relationships`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRelationships(data);
    } catch {
      toast.error("관계 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRels();
  }, [userId]);

  const searchUsers = async () => {
    if (!targetSearch.trim()) return;
    try {
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(targetSearch)}&limit=20`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTargetUsers(data.users.filter((u: UserItem) => u.id !== userId));
    } catch {
      toast.error("사용자 검색에 실패했습니다.");
    }
  };

  const handleAdd = async () => {
    if (!selectedTargetId || !selectedType) {
      toast.error("대상 사용자와 관계 유형을 선택하세요.");
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${userId}/relationships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetId: selectedTargetId, type: selectedType }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error);
      }
      toast.success("관계가 설정되었습니다.");
      setSelectedTargetId("");
      fetchRels();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "설정에 실패했습니다.");
    }
  };

  const handleRemove = async (targetId: string, type: string) => {
    try {
      const res = await fetch(
        `/api/admin/users/${userId}/relationships?targetId=${targetId}&type=${type}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error();
      toast.success("관계가 삭제되었습니다.");
      fetchRels();
    } catch {
      toast.error("삭제에 실패했습니다.");
    }
  };

  const relsByType = {
    FRIEND: relationships.filter((r) => r.type === "FRIEND"),
    FAMILY: relationships.filter((r) => r.type === "FAMILY"),
    PARTNERS: relationships.filter((r) => r.type === "PARTNERS"),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          관계 설정 (관리자 일방)
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          "{userName}" 사용자에 대해 친구/가족/파트너스를 설정합니다.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="대상 사용자 검색 (이름, 이메일)"
            value={targetSearch}
            onChange={(e) => setTargetSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchUsers()}
            className="w-48"
          />
          <Button variant="outline" onClick={searchUsers}>검색</Button>
          <Select value={selectedTargetId} onValueChange={setSelectedTargetId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="대상 선택" />
            </SelectTrigger>
            <SelectContent>
              {targetUsers.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name || u.email || u.username || u.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedType} onValueChange={(v) => setSelectedType(v as typeof selectedType)}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {REL_TYPES.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleAdd}>추가</Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        ) : (
          <div className="space-y-3">
            {REL_TYPES.map(({ value, label, icon: Icon }) => (
              <div key={value}>
                <p className="text-sm font-medium flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4" /> {label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {relsByType[value as keyof typeof relsByType].length === 0 ? (
                    <span className="text-xs text-muted-foreground">없음</span>
                  ) : (
                    relsByType[value as keyof typeof relsByType].map((r) => (
                      <span
                        key={r.id}
                        className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-sm"
                      >
                        {r.target.name || r.target.email || r.target.username || r.targetId}
                        <button
                          type="button"
                          onClick={() => handleRemove(r.targetId, r.type)}
                          className="text-destructive hover:bg-destructive/10 rounded p-0.5"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
