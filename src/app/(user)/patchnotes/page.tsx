import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function PatchNotesPage() {
  let notes: { id: string; version: string; title: string; content: string; createdAt: Date }[] = [];
  try {
    notes = await prisma.patchNote.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch {
    notes = [];
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">패치 노트</h1>
      <p className="text-muted-foreground mb-8">
        서비스 업데이트 내역을 확인할 수 있습니다.
      </p>

      <div className="space-y-4">
        {notes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              아직 등록된 패치 노트가 없습니다.
            </CardContent>
          </Card>
        ) : (
          notes.map((note) => (
            <Card key={note.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{note.version}</Badge>
                  <h2 className="text-lg font-semibold">{note.title}</h2>
                  <span className="text-sm text-muted-foreground ml-auto">
                    {new Date(note.createdAt).toLocaleDateString("ko-KR")}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm">{note.content}</div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
