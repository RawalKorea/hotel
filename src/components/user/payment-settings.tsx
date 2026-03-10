"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Coins, CreditCard, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

type SavedMethod = {
  id: string;
  cardNickname: string | null;
  cardNumberMasked: string;
  isDefault: boolean;
};

export function PaymentSettings() {
  const [pointBalance, setPointBalance] = useState(0);
  const [savedMethods, setSavedMethods] = useState<SavedMethod[]>([]);
  const [hasPaymentPassword, setHasPaymentPassword] = useState(false);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [cardNickname, setCardNickname] = useState("");
  const [cardMask, setCardMask] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = () => {
    fetch("/api/user/points")
      .then((r) => r.json())
      .then((d) => setPointBalance(d.balance ?? 0))
      .catch(() => {});
    fetch("/api/user/payment-methods")
      .then((r) => r.json())
      .then(setSavedMethods)
      .catch(() => setSavedMethods([]));
    // paymentPassword 존재 여부는 별도 API가 없으므로, 설정 시점에만 확인
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddCard = async () => {
    const masked = cardMask.trim() || "****-****-****-****";
    if (!/^[\d*\-]+$/.test(masked)) {
      toast.error("카드 번호 형식이 올바르지 않습니다. (예: ****-****-****-1234)");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/payment-methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardNickname: cardNickname.trim() || null,
          cardNumberMasked: masked,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success("결제 수단이 등록되었습니다.");
      setAddCardOpen(false);
      setCardNickname("");
      setCardMask("");
      fetchData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "등록 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm("이 결제 수단을 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/user/payment-methods/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      toast.success("삭제되었습니다.");
      fetchData();
    } catch {
      toast.error("삭제 실패");
    }
  };

  const handleSetPassword = async () => {
    const pw = newPassword.replace(/\D/g, "");
    if (pw.length < 4 || pw.length > 6) {
      toast.error("4~6자리 숫자를 입력해주세요.");
      return;
    }
    if (pw !== confirmPassword.replace(/\D/g, "")) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/payment-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "set", password: pw }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("결제 비밀번호가 설정되었습니다.");
      setPasswordOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      setHasPaymentPassword(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "설정 실패");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            포인트
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{pointBalance.toLocaleString()}P</p>
          <p className="text-sm text-muted-foreground">
            예약 시 포인트로 결제할 수 있습니다.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            등록된 결제 수단
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {savedMethods.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              등록된 결제 수단이 없습니다.
            </p>
          ) : (
            savedMethods.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded border p-3"
              >
                <span>
                  {m.cardNickname || "등록 카드"} {m.cardNumberMasked}
                  {m.isDefault && " (기본)"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleDeleteCard(m.id)}
                >
                  삭제
                </Button>
              </div>
            ))
          )}
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => setAddCardOpen(true)}
          >
            결제 수단 등록
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            결제 비밀번호
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            빠른 결제(등록된 카드) 시 비밀번호만 입력해 결제할 수 있습니다.
          </p>
          <Button variant="outline" onClick={() => setPasswordOpen(true)}>
            {hasPaymentPassword ? "비밀번호 변경" : "비밀번호 설정"}
          </Button>
        </CardContent>
      </Card>

      <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>결제 수단 등록</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>카드 별칭 (선택)</Label>
              <Input
                placeholder="예: 개인 카드"
                value={cardNickname}
                onChange={(e) => setCardNickname(e.target.value)}
              />
            </div>
            <div>
              <Label>카드 번호 (마스킹)</Label>
              <Input
                placeholder="****-****-****-1234"
                value={cardMask}
                onChange={(e) => setCardMask(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                실제 카드 등록은 결제 시 Portone을 통해 진행됩니다. 여기서는
                표시용 마스킹 번호만 저장합니다.
              </p>
            </div>
            <Button
              className="w-full"
              onClick={handleAddCard}
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              등록
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>결제 비밀번호 설정</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>비밀번호 (4~6자리 숫자)</Label>
              <Input
                type="password"
                inputMode="numeric"
                placeholder="4~6자리"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>
            <div>
              <Label>비밀번호 확인</Label>
              <Input
                type="password"
                inputMode="numeric"
                placeholder="다시 입력"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value.replace(/\D/g, ""))
                }
              />
            </div>
            <Button
              className="w-full"
              onClick={handleSetPassword}
              disabled={
                isLoading ||
                newPassword.length < 4 ||
                newPassword !== confirmPassword
              }
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              설정
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
