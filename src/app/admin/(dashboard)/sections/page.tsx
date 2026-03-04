import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAllSections } from "@/lib/admin-queries";
import { SectionsManager } from "./SectionsManager";

export const metadata = { title: "Manage Sections" };

export default async function AdminSectionsPage() {
  const data = await getAllSections();

  return (
    <>
      <AdminHeader title="Page Sections" />
      <div className="p-8">
        <SectionsManager initialData={data} />
      </div>
    </>
  );
}
