import { count, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  stats,
  initiatives,
  leadership,
  partners,
  pageSections,
  contactSubmissions,
  users,
  siteConfig,
} from "@/db/schema";
import type { GcsConfig } from "@/lib/gcs";

function db() {
  const d = getDb();
  if (!d) throw new Error("Database not configured");
  return d;
}

export async function getDashboardCounts() {
  const d = db();
  const [statsCount] = await d.select({ count: count() }).from(stats);
  const [initiativesCount] = await d.select({ count: count() }).from(initiatives);
  const [leadershipCount] = await d.select({ count: count() }).from(leadership);
  const [partnersCount] = await d.select({ count: count() }).from(partners);
  const [sectionsCount] = await d.select({ count: count() }).from(pageSections);
  const [contactsCount] = await d.select({ count: count() }).from(contactSubmissions);
  const [unreadCount] = await d
    .select({ count: count() })
    .from(contactSubmissions)
    .where(eq(contactSubmissions.read, false));

  const [usersCount] = await d.select({ count: count() }).from(users);

  return {
    stats: statsCount.count,
    initiatives: initiativesCount.count,
    leadership: leadershipCount.count,
    partners: partnersCount.count,
    sections: sectionsCount.count,
    contacts: contactsCount.count,
    unreadContacts: unreadCount.count,
    users: usersCount.count,
  };
}

export async function getAllStats() {
  return db().select().from(stats).orderBy(stats.orderIndex);
}

export async function getAllInitiatives() {
  return db().select().from(initiatives).orderBy(initiatives.orderIndex);
}

export async function getAllLeadership() {
  return db().select().from(leadership).orderBy(leadership.orderIndex);
}

export async function getAllPartners() {
  return db().select().from(partners).orderBy(partners.orderIndex);
}

export async function getAllSections() {
  return db().select().from(pageSections).orderBy(pageSections.pageSlug, pageSections.orderIndex);
}

export async function getAllContacts() {
  return db().select().from(contactSubmissions).orderBy(contactSubmissions.createdAt);
}

const GCS_KEYS = [
  "gcs_project_id",
  "gcs_bucket_name",
  "gcs_credentials",
  "gcs_cdn_base_url",
] as const;

export async function getGcsConfig(): Promise<GcsConfig | null> {
  const d = db();
  const rows = await d
    .select({ key: siteConfig.key, value: siteConfig.value })
    .from(siteConfig)
    .where(inArray(siteConfig.key, [...GCS_KEYS]));

  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  if (!map.gcs_project_id || !map.gcs_bucket_name || !map.gcs_credentials) {
    return null;
  }

  return {
    projectId: map.gcs_project_id,
    bucketName: map.gcs_bucket_name,
    credentials: map.gcs_credentials,
    cdnBaseUrl:
      map.gcs_cdn_base_url ||
      `https://storage.googleapis.com/${map.gcs_bucket_name}`,
  };
}

export async function getGcsSettingsRaw(): Promise<Record<string, string>> {
  const d = db();
  const rows = await d
    .select({ key: siteConfig.key, value: siteConfig.value })
    .from(siteConfig)
    .where(inArray(siteConfig.key, [...GCS_KEYS]));

  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getAllUsers() {
  return db()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);
}
