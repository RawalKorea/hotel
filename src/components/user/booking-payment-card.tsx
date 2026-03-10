"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PaymentModal } from "./payment-modal";

export function BookingPaymentCard({
  bookingId,
  status,
  paymentStatus,
  amount,
}: {
  bookingId: string;
  status: string;
  paymentStatus: string;
  amount: number;
}) {
  const router = useRouter();
  const [paymentOpen, setPaymentOpen] = useState(false);

  const needsPayment = status === "PENDING" && paymentStatus === "PENDING";

  const handleSuccess = () => {
    router.refresh();
  };

  if (!needsPayment) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>결제 상태</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {paymentStatus === "PAID"
              ? "결제가 완료되었습니다."
              : "이미 처리된 예약입니다."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>결제하기</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            ₩{amount.toLocaleString()} 결제가 필요합니다.
          </p>
          <Button onClick={() => setPaymentOpen(true)}>결제하기</Button>
        </CardContent>
      </Card>

      <PaymentModal
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        bookingId={bookingId}
        amount={amount}
        onSuccess={handleSuccess}
      />
    </>
  );
}
