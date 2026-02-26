import { AdminHeader } from "@/components/admin/admin-header";
import { prisma } from "@/lib/prisma";
import { AIManager } from "@/components/admin/ai-manager";

export const dynamic = "force-dynamic";

export default async function AdminAIPage() {
  let documents: Awaited<ReturnType<typeof prisma.aIDocument.findMany>>;
  let faqEntries: Awaited<ReturnType<typeof prisma.fAQEntry.findMany>>;
  let settings: Awaited<ReturnType<typeof prisma.chatbotSettings.findFirst>>;

  try {
    [documents, faqEntries, settings] = await Promise.all([
      prisma.aIDocument.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.fAQEntry.findMany({ orderBy: { sortOrder: "asc" } }),
      prisma.chatbotSettings.findFirst(),
    ]);
  } catch {
    documents = [];
    faqEntries = [];
    settings = null;
  }

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
