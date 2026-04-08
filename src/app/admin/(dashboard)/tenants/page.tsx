import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAllTenants } from "@/lib/admin-queries";
import { TenantsManager } from "./TenantsManager";

export const metadata = { title: "Manage Tenants" };

export default async function AdminTenantsPage() {
  const data = await getAllTenants();

  return (
    <>
      <AdminHeader title="Airport Tenants" />
      <div className="p-8">
        <TenantsManager initialData={data} />
      </div>
    </>
  );
}
