import { auth } from "@/lib/auth";
import { InquiryForm } from "@/components/user/inquiry-form";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const session = await auth();

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">문의하기</h1>
        <p className="text-muted-foreground">
          궁금한 점이 있으시면 편하게 문의해 주세요. 빠르게 답변 드리겠습니다.
        </p>
      </div>
      <InquiryForm userId={session?.user?.id} />
    </div>
  );
}
