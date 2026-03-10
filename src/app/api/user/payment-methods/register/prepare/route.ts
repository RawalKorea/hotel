import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * 빌링키 발급용 customer_uid, merchant_uid 발급
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const customerUid = `billing_${session.user.id}_${Date.now()}`;
  const merchantUid = `reg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return NextResponse.json({
    customer_uid: customerUid,
    merchant_uid: merchantUid,
  });
}
