import { getPublicSettings } from "@/lib/settings";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

const DEFAULT_PRIVACY = `1. 수집하는 개인정보 항목
- 필수: 이름, 이메일, 전화번호, 예약 정보
- 선택: 주소, 특별 요청 사항

2. 개인정보의 수집 목적
- 예약 서비스 제공
- 고객 문의 응대
- 서비스 개선

3. 개인정보의 보유 및 이용 기간
- 예약 완료 후 3년 또는 법령에 따른 기간

4. 개인정보의 제3자 제공
- 원칙적으로 제3자에게 제공하지 않습니다.

5. 개인정보의 안전성 확보
- 암호화, 접근 제한 등 필요한 조치를 취합니다.

※ 관리자 → 설정에서 개인정보 처리방침 내용을 수정할 수 있습니다.`;

export default async function PrivacyPage() {
  const settings = await getPublicSettings();
  const content = settings.privacyContent || DEFAULT_PRIVACY;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">개인정보 처리방침</h1>
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap">
            {content.split("\n").map((line, i) => {
              if (/^\d+\./.test(line) && !line.startsWith("  ")) {
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
