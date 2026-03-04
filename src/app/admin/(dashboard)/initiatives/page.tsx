import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAllInitiatives } from "@/lib/admin-queries";
import { InitiativesManager } from "./InitiativesManager";

export const metadata = { title: "Manage Initiatives" };

export default async function AdminInitiativesPage() {
  const data = await getAllInitiatives();

  return (
    <>
      <AdminHeader title="Initiatives" />
      <div className="p-8">
        <InitiativesManager initialData={data} />
      </div>
    </>
  );
}
