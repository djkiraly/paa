import { AdminHeader } from "@/components/admin/AdminHeader";
import { getAllLeadership, getGcsConfig } from "@/lib/admin-queries";
import { LeadershipManager } from "./LeadershipManager";

export const metadata = { title: "Manage Leadership" };

export default async function AdminLeadershipPage() {
  const data = await getAllLeadership();
  const gcsConfig = await getGcsConfig().catch(() => null);

  return (
    <>
      <AdminHeader title="Leadership" />
      <div className="p-8">
        <LeadershipManager initialData={data} gcsConfigured={!!gcsConfig} />
      </div>
    </>
  );
}
