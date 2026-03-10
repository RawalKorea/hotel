"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Coins, Wallet, Loader2, Lock } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import { toast } from "sonner";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

type SavedMethod = {
  id: string;
  cardNickname: string | null;
  cardNumberMasked: string;
  isDefault: boolean;
};

export function PaymentModal({
  open,
  onOpenChange,
  bookingId,
  amount,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string;
  amount: number;
  onSuccess: () => void;
}) {
  const [method, setMethod] = useState<"POINT" | "CARD" | "SAVED_CARD">("CARD");
  const [pointBalance, setPointBalance] = useState(0);
  const [savedMethods, setSavedMethods] = useState<SavedMethod[]>([]);
  const [selectedSavedId, setSelectedSavedId] = useState<string | null>(null);
  const [paymentPassword, setPaymentPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetch("/api/user/points")
        .then((r) => r.json())
        .then((d) => setPointBalance(d.balance ?? 0))
        .catch(() => {});
      fetch("/api/user/payment-methods")
        .then((r) => r.json())
        .then(setSavedMethods)
        .catch(() => setSavedMethods([]));
      setSelectedSavedId(null);
      setPaymentPassword("");
    }
  }, [open]);

  useEffect(() => {
    if (savedMethods.length > 0 && !selectedSavedId) {
      const def = savedMethods.find((m) => m.isDefault) ?? savedMethods[0];
      setSelectedSavedId(def.id);
    }
  }, [savedMethods, selectedSavedId]);

  const canPayPoint = pointBalance >= amount;
  const canPaySaved =
    method === "SAVED_CARD" &&
    selectedSavedId &&
    paymentPassword.length >= 4;

  const handlePay = async () => {
    if (method === "POINT" && !canPayPoint) {
      toast.error("포인트가 부족합니다.");
      return;
    }
    if (method === "SAVED_CARD" && !canPaySaved) {
      toast.error("결제 비밀번호를 입력해주세요 (4~6자리).");
      return;
    }

    setIsLoading(true);
    try {
      const body: Record<string, unknown> = {
        bookingId,
        method,
      };
      if (method === "SAVED_CARD") {
        body.savedMethodId = selectedSavedId;
        body.paymentPassword = paymentPassword.replace(/\D/g, "");
      }

      const res = await fetch("/api/payments/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.needPayment && data.merchantUid) {
          const storeId = process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
          const w = typeof window !== "undefined" ? window : null;
          type WinIMP = { IMP?: { init: (id: string) => void; request_pay: (o: object, cb: (r: { success?: boolean; imp_uid?: string; error_msg?: string }) => void) => void } };
          const imp = w && "IMP" in w ? (w as WinIMP).IMP : null;

          if (storeId && imp) {
            imp.init(storeId);
            imp.request_pay(
              {
                pg: "nice",
                pay_method: "card",
                merchant_uid: data.merchantUid,
                amount,
                name: "객실 예약",
                buyer_name: "",
                buyer_email: "",
              },
              (r) => {
                if (r.success && r.imp_uid) {
                  fetch("/api/payments/execute", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      bookingId,
                      method: "CARD",
                      impUid: r.imp_uid,
                      merchantUid: data.merchantUid,
                    }),
                  })
                    .then((re) => re.json())
                    .then(() => {
                      toast.success("결제가 완료되었습니다!");
                      onSuccess();
                      onOpenChange(false);
                    })
                    .catch(() => toast.error("결제 처리 실패"));
                } else {
                  toast.error(r.error_msg || "결제가 취소되었습니다.");
                }
              }
            );
          } else {
            toast.info("카드 결제는 Portone 설정 후 이용 가능합니다. 테스트 모드로 진행합니다.");
            fetch("/api/payments/execute", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId,
                method: "CARD",
                impUid: `test_${Date.now()}`,
                merchantUid: data.merchantUid,
              }),
            })
              .then((re) => (re.ok ? re.json() : re.json().then((d) => { throw new Error(d.error); })))
              .then(() => {
                toast.success("결제가 완료되었습니다! (테스트)");
                onSuccess();
                onOpenChange(false);
              })
              .catch((e) => toast.error(e?.message || "결제 실패"));
          }
        } else {
          throw new Error(data.error || "결제 실패");
        }
        return;
      }

      toast.success("결제가 완료되었습니다!");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "결제 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <LoadingOverlay />}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>결제</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-lg font-bold">
              결제 금액: ₩{formatPrice(amount)}
            </p>

            <div className="space-y-2">
              {[
                {
                  value: "POINT" as const,
                  label: "포인트 결제",
                  icon: Coins,
                  extra: `(보유: ${pointBalance.toLocaleString()}P)`,
                },
                { value: "CARD" as const, label: "즉시 결제 (카드)", icon: CreditCard },
                {
                  value: "SAVED_CARD" as const,
                  label: "빠른 결제 (등록된 카드)",
                  icon: Wallet,
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setMethod(opt.value)}
                  className={`flex w-full items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
                    method === opt.value ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div
                    className={`h-4 w-4 rounded-full border-2 ${
                      method === opt.value ? "border-primary bg-primary" : ""
                    }`}
                  />
                  <opt.icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1">
                    {opt.label}
                    {opt.extra && (
                      <span className="text-sm text-muted-foreground ml-1">
                        {opt.extra}
                      </span>
                    )}
                  </span>
                </button>
              ))}
              {!canPayPoint && method === "POINT" && (
                <p className="text-sm text-destructive">포인트가 부족합니다.</p>
              )}
            </div>

            {method === "SAVED_CARD" && (
              <div className="space-y-2">
                <Label>등록된 카드</Label>
                <div className="space-y-1">
                  {savedMethods.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      등록된 결제 수단이 없습니다. 마이페이지에서 등록해주세요.
                    </p>
                  ) : (
                    savedMethods.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-2 rounded border p-2"
                      >
                        <input
                          type="radio"
                          name="saved"
                          checked={selectedSavedId === m.id}
                          onChange={() => setSelectedSavedId(m.id)}
                        />
                        <span>
                          {m.cardNickname || "등록 카드"} {m.cardNumberMasked}
                          {m.isDefault && " (기본)"}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-1">
                    <Lock className="h-4 w-4" />
                    결제 비밀번호
                  </Label>
                  <Input
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="4~6자리 숫자"
                    maxLength={6}
                    value={paymentPassword}
                    onChange={(e) =>
                      setPaymentPassword(e.target.value.replace(/\D/g, ""))
                    }
                  />
                </div>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handlePay}
              disabled={
                isLoading ||
                (method === "POINT" && !canPayPoint) ||
                (method === "SAVED_CARD" &&
                  (savedMethods.length === 0 || !canPaySaved))
              }
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              ₩{formatPrice(amount)} 결제하기
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
