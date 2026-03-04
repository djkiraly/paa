import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAllUsers } from "@/lib/admin-queries";
import { auth } from "@/lib/auth";
import { UsersManager } from "./UsersManager";

export const metadata = { title: "Manage Users" };

export default async function AdminUsersPage() {
  const [data, session] = await Promise.all([getAllUsers(), auth()]);

  return (
    <>
      <AdminHeader title="Admin Users" />
      <div className="p-8">
        <UsersManager initialData={data} currentUserId={session?.user?.id ?? ""} />
      </div>
    </>
  );
}
