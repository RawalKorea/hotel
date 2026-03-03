import { getPublicSettings } from "@/lib/settings";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const settings = await getPublicSettings();
  const content = settings.aboutContent || `## 호텔 소개

저희 호텔에 오신 것을 환영합니다.

### 비전
최고의 서비스와 편안한 휴식을 제공합니다.

### 위치
설정에서 주소를 등록해 주세요.

**관리자 → 설정**에서 이 내용을 수정할 수 있습니다.`;

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">호텔 소개</h1>
      <Card>
        <CardContent className="pt-6">
          <div className="prose prose-slate dark:prose-invert max-w-none whitespace-pre-wrap">
            {content.split("\n").map((line, i) => {
              if (line.startsWith("## ")) {
                return <h2 key={i} className="text-xl font-semibold mt-6 mb-2">{line.slice(3)}</h2>;
              }
              if (line.startsWith("### ")) {
                return <h3 key={i} className="text-lg font-medium mt-4 mb-1">{line.slice(4)}</h3>;
              }
              return <p key={i} className="mb-2">{line || <br />}</p>;
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
