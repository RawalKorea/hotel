import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PaymentSettings } from "@/components/user/payment-settings";

export const dynamic = "force-dynamic";

export default async function PaymentSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">결제 관리</h1>
      <PaymentSettings />
    </div>
  );
}
