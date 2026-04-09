import { desc, eq, count } from "drizzle-orm";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { getDb } from "@/db";
import { auditLogs } from "@/db/schema";
import { AuditLogViewer } from "./AuditLogViewer";

export const metadata = { title: "Audit Log" };

const PAGE_SIZE = 50;

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; type?: string }>;
}) {
  const { page: pageParam, type: typeFilter } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const db = getDb();
  if (!db) {
    return (
      <>
        <AdminHeader title="Audit Log" />
        <div className="p-8 text-[var(--paa-gray)]">Database not configured</div>
      </>
    );
  }

  const whereClause = typeFilter ? eq(auditLogs.entityType, typeFilter) : undefined;

  const [entries, [{ total }]] = await Promise.all([
    db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(PAGE_SIZE)
      .offset(offset),
    db
      .select({ total: count() })
      .from(auditLogs)
      .where(whereClause),
  ]);

  return (
    <>
      <AdminHeader title="Audit Log" />
      <div className="p-8">
        <AuditLogViewer
          entries={entries}
          total={total}
          page={page}
          filter={typeFilter || ""}
        />
      </div>
    </>
  );
}
