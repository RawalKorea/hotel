export interface PaymentRequest {
  merchantUid: string;
  amount: number;
  name: string;
  buyerName: string;
  buyerEmail: string;
  buyerTel?: string;
}

export function generateMerchantUid() {
  return `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
