import { AdminHeader } from "@/components/admin/admin-header";
import { PatchNoteManager } from "@/components/admin/patch-note-manager";

export const dynamic = "force-dynamic";

export default function AdminPatchNotesPage() {
  return (
    <>
      <AdminHeader title="패치 노트" />
      <div className="p-6">
        <PatchNoteManager />
      </div>
    </>
  );
}
