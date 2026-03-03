import { AdminHeader } from "@/components/admin/admin-header";
import { InquiryList } from "@/components/admin/inquiry-list";

export const dynamic = "force-dynamic";

export default function AdminInquiriesPage() {
  return (
    <>
      <AdminHeader title="고객 문의" />
      <div className="p-6">
        <InquiryList />
      </div>
    </>
  );
}
