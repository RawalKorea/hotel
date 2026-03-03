import { AdminHeader } from "@/components/admin/admin-header";
import { DangerPermissionsForm } from "@/components/admin/danger-permissions-form";
import { EventCarouselSettings } from "@/components/admin/event-carousel-settings";
import { EventManager } from "@/components/admin/event-manager";
import { ThemeSettingsForm } from "@/components/admin/theme-settings-form";
import { RoomOptionsForm } from "@/components/admin/room-options-form";

export const dynamic = "force-dynamic";

export default function AdminDangerPage() {
  return (
    <>
      <AdminHeader title="위험 권한" />
      <div className="p-6 space-y-8">
        <DangerPermissionsForm />
        <RoomOptionsForm />
        <EventCarouselSettings />
        <EventManager />
        <ThemeSettingsForm />
      </div>
    </>
  );
}
