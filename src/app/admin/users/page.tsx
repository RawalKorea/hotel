import { AdminHeader } from "@/components/admin/admin-header";
import { UserList } from "@/components/admin/user-list";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return (
    <>
      <AdminHeader title="고객 관리" />
      <div className="p-6">
        <UserList />
      </div>
    </>
  );
}
