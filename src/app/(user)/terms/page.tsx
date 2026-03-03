import { getPublicSettings } from "@/lib/settings";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const DEFAULT_TERMS = `제1조 (목적)
본 약관은 StayNest 호텔 예약 서비스 이용에 관한 사항을 규정합니다.

제2조 (서비스의 내용)
서비스는 호텔 객실 예약, 결제, 예약 관리 등의 기능을 제공합니다.

제3조 (이용 약관의 동의)
서비스를 이용함으로써 본 약관에 동의한 것으로 간주됩니다.

제4조 (개인정보)
개인정보 처리방침에 따라 수집·이용됩니다.

※ 관리자 → 설정에서 이용약관 내용을 수정할 수 있습니다.`;

export default async function TermsPage() {
  const settings = await getPublicSettings();
  const content = settings.termsContent || DEFAULT_TERMS;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">이용약관</h1>
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap">
            {content.split("\n").map((line, i) => {
              if (line.startsWith("제") && line.includes("조")) {
                return <h2 key={i} className="text-lg font-semibold mt-6 mb-2">{line}</h2>;
              }
              return <p key={i} className="mb-2">{line || <br />}</p>;
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
