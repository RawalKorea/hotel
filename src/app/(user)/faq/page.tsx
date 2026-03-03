import { getPublicSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function FAQPage() {
  const settings = await getPublicSettings();
  const customContent = settings.faqContent;

  let faqEntries: { question: string; answer: string }[] = [];

  if (customContent?.trim()) {
    const lines = customContent.split("\n").filter(Boolean);
    let currentQ = "";
    let currentA = "";
    for (const line of lines) {
      if (line.startsWith("Q: ") || line.startsWith("Q.")) {
        if (currentQ) faqEntries.push({ question: currentQ, answer: currentA.trim() });
        currentQ = line.replace(/^Q[.:]\s*/, "").trim();
        currentA = "";
      } else if (line.startsWith("A: ") || line.startsWith("A.")) {
        currentA = line.replace(/^A[.:]\s*/, "").trim();
      } else if (currentQ && line.trim()) {
        currentA += (currentA ? "\n" : "") + line.trim();
      }
    }
    if (currentQ) faqEntries.push({ question: currentQ, answer: currentA || "-" });
  }

  if (faqEntries.length === 0) {
    try {
      const dbFaq = await prisma.fAQEntry.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 20,
      });
      faqEntries = dbFaq.map((f) => ({ question: f.question, answer: f.answer }));
    } catch {
      faqEntries = [
        { question: "체크인/체크아웃 시간은 언제인가요?", answer: "체크인은 오후 3시, 체크아웃은 오전 11시입니다. 설정에서 변경 가능합니다." },
        { question: "취소 정책은 어떻게 되나요?", answer: "체크인 1일 전까지 무료 취소가 가능합니다. 자세한 내용은 설정을 확인해 주세요." },
      ];
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">자주 묻는 질문</h1>
      <Card>
        <CardContent className="pt-6">
          <Accordion type="single" collapsible className="w-full">
            {faqEntries.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent className="whitespace-pre-wrap">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {faqEntries.length === 0 && (
            <p className="text-muted-foreground text-center py-8">
              등록된 FAQ가 없습니다. 관리자 설정에서 추가해 주세요.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
