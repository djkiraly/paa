import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAllPartners, getGcsConfig } from "@/lib/admin-queries";
import { PartnersManager } from "./PartnersManager";

export const metadata = { title: "Manage Partners" };

export default async function AdminPartnersPage() {
  const data = await getAllPartners();
  const gcsConfig = await getGcsConfig().catch(() => null);

  return (
    <>
      <AdminHeader title="Partners" />
      <div className="p-8">
        <PartnersManager initialData={data} gcsConfigured={!!gcsConfig} />
      </div>
    </>
  );
}
