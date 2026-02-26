import { AdminHeader } from "@/components/admin/admin-header";
import { prisma } from "@/lib/prisma";
import { AIManager } from "@/components/admin/ai-manager";

export const dynamic = "force-dynamic";

export default async function AdminAIPage() {
  const [documents, faqEntries, settings] = await Promise.all([
    prisma.aIDocument.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.fAQEntry.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.chatbotSettings.findFirst(),
  ]);

  return (
    <>
      <AdminHeader title="AI 엔진 관리" />
      <div className="p-6">
        <AIManager
          initialDocuments={documents}
          initialFaqEntries={faqEntries}
          initialSettings={settings}
        />
      </div>
    </>
  );
}
