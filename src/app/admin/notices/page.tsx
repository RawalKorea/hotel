import { AdminHeader } from "@/components/admin/admin-header";
import { NoticeList } from "@/components/admin/notice-list";

export const dynamic = "force-dynamic";

export default function AdminNoticesPage() {
  return (
    <>
      <AdminHeader title="공지사항" />
      <div className="p-6">
        <NoticeList />
      </div>
    </>
  );
}
