/**
 * Portone(아임포트) REST API 연동
 * - 토큰 발급, 결제 검증
 */

const IAMPORT_API = "https://api.iamport.kr";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  const impKey =
    process.env.PORTONE_IMP_KEY || process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
  const impSecret =
    process.env.PORTONE_IMP_SECRET || process.env.PORTONE_API_SECRET;

  if (!impKey || !impSecret) {
    throw new Error("Portone API 키가 설정되지 않았습니다.");
  }

  const res = await fetch(`${IAMPORT_API}/users/getToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      imp_key: impKey,
      imp_secret: impSecret,
    }),
  });

  const data = await res.json();
  if (data.code !== 0 || !data.response?.access_token) {
    throw new Error(data.message || "Portone 토큰 발급 실패");
  }

  const token = data.response.access_token as string;
  cachedToken = token;
  tokenExpiresAt = Date.now() + (data.response.expire ?? 3600) * 1000;
  return token;
}

export type PortonePayment = {
  imp_uid: string;
  merchant_uid: string;
  amount: number;
  status: string;
  paid_at?: number;
  card_name?: string;
  card_number?: string;
  card_number_mask?: string;
  [key: string]: unknown;
};

export async function getPayment(impUid: string): Promise<PortonePayment | null> {
  const token = await getAccessToken();

  const res = await fetch(`${IAMPORT_API}/payments/${impUid}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (data.code !== 0) {
    return null;
  }

  return data.response as PortonePayment;
}

export async function verifyPayment(
  impUid: string,
  expectedAmount: number,
  expectedMerchantUid: string
): Promise<{ ok: boolean; error?: string }> {
  const payment = await getPayment(impUid);
  if (!payment) {
    return { ok: false, error: "결제 정보를 조회할 수 없습니다." };
  }

  if (payment.status?.toLowerCase() !== "paid") {
    return { ok: false, error: `결제 상태가 유효하지 않습니다. (${payment.status})` };
  }

  if (payment.amount !== expectedAmount) {
    return { ok: false, error: "결제 금액이 일치하지 않습니다." };
  }

  if (payment.merchant_uid !== expectedMerchantUid) {
    return { ok: false, error: "주문번호가 일치하지 않습니다." };
  }

  return { ok: true };
}

export function isPortoneConfigured(): boolean {
  const impKey =
    process.env.PORTONE_IMP_KEY || process.env.NEXT_PUBLIC_PORTONE_STORE_ID;
  const impSecret =
    process.env.PORTONE_IMP_SECRET || process.env.PORTONE_API_SECRET;
  return !!(impKey && impSecret);
}

export type BillingPaymentResult = {
  ok: boolean;
  imp_uid?: string;
  error?: string;
};

export async function requestBillingPayment(
  customerUid: string,
  merchantUid: string,
  amount: number,
  name: string
): Promise<BillingPaymentResult> {
  const token = await getAccessToken();

  const res = await fetch(`${IAMPORT_API}/subscribe/payments/again`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      customer_uid: customerUid,
      merchant_uid: merchantUid,
      amount,
      name,
    }),
  });

  const data = await res.json();

  if (data.code !== 0) {
    return {
      ok: false,
      error: data.message || "빌링키 결제에 실패했습니다.",
    };
  }

  const impUid = data.response?.imp_uid;
  if (!impUid) {
    return { ok: false, error: "결제 응답에 imp_uid가 없습니다." };
  }

  return { ok: true, imp_uid: impUid };
}
