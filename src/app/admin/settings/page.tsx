import { AdminHeader } from "@/components/admin/admin-header";
import { SettingsForm } from "@/components/admin/settings-form";

export const dynamic = "force-dynamic";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminHeader title="설정" />
      <div className="p-6">
        <SettingsForm />
      </div>
    </>
  );
}
