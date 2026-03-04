import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SessionProvider } from "@/components/admin/SessionProvider";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-[var(--paa-midnight)]">
        <AdminSidebar />
        <div className="pl-64">{children}</div>
      </div>
    </SessionProvider>
  );
}
