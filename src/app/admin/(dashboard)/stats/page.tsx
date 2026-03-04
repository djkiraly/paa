import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAllStats } from "@/lib/admin-queries";
import { StatsManager } from "./StatsManager";

export const metadata = { title: "Manage Stats" };

export default async function AdminStatsPage() {
  const data = await getAllStats();

  return (
    <>
      <AdminHeader title="Stats" />
      <div className="p-8">
        <StatsManager initialData={data} />
      </div>
    </>
  );
}
