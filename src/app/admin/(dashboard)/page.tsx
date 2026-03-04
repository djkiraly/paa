import { AdminHeader } from "@/components/admin/AdminHeader";
import { DashboardCard } from "@/components/admin/DashboardCard";
import { getDashboardCounts } from "@/lib/admin-queries";

export const metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const counts = await getDashboardCounts();

  return (
    <>
      <AdminHeader title="Dashboard" />
      <div className="p-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardCard
            label="Stats"
            count={counts.stats}
            href="/admin/stats"
            icon="📈"
          />
          <DashboardCard
            label="Initiatives"
            count={counts.initiatives}
            href="/admin/initiatives"
            icon="🎯"
          />
          <DashboardCard
            label="Leadership"
            count={counts.leadership}
            href="/admin/leadership"
            icon="👥"
          />
          <DashboardCard
            label="Partners"
            count={counts.partners}
            href="/admin/partners"
            icon="🤝"
          />
          <DashboardCard
            label="Page Sections"
            count={counts.sections}
            href="/admin/sections"
            icon="📄"
          />
          <DashboardCard
            label="Contacts"
            count={counts.contacts}
            href="/admin/contacts"
            icon="✉️"
          />
          <DashboardCard
            label="Unread Contacts"
            count={counts.unreadContacts}
            href="/admin/contacts"
            icon="🔔"
          />
          <DashboardCard
            label="Admin Users"
            count={counts.users}
            href="/admin/users"
            icon="🔑"
          />
        </div>
      </div>
    </>
  );
}
