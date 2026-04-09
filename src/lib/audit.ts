import { getDb } from "@/db";
import { auditLogs } from "@/db/schema";

export async function logAudit(params: {
  userId: string;
  userEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  entityName?: string;
  details?: string;
}): Promise<void> {
  try {
    const db = getDb();
    if (!db) return;
    await db.insert(auditLogs).values({
      userId: params.userId,
      userEmail: params.userEmail,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId || null,
      entityName: params.entityName || null,
      details: params.details || null,
    });
  } catch (err) {
    console.error("Audit log failed:", err);
  }
}
