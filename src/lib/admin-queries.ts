import { count, eq, inArray } from "drizzle-orm";
import { getDb } from "@/db";
import {
  stats,
  initiatives,
  leadership,
  partners,
  pageSections,
  contactSubmissions,
  tenants,
  users,
  siteConfig,
} from "@/db/schema";
import type { GcsConfig } from "@/lib/gcs";
import type { GmailConfig } from "@/lib/gmail";

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

export async function getAllTenants() {
  return db().select().from(tenants).orderBy(tenants.orderIndex);
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

const GENERAL_KEYS = [
  "site_name",
  "tagline",
  "contact_email",
  "location",
] as const;

export async function getGeneralSettingsRaw(): Promise<Record<string, string>> {
  const d = db();
  const rows = await d
    .select({ key: siteConfig.key, value: siteConfig.value })
    .from(siteConfig)
    .where(inArray(siteConfig.key, [...GENERAL_KEYS]));
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

const APPEARANCE_KEYS = [
  "theme_midnight",
  "theme_navy",
  "theme_slate",
  "theme_accent",
  "theme_accent_light",
  "theme_accent_dark",
  "theme_sky",
  "theme_sky_light",
  "theme_white",
  "theme_gray",
  "logo_url",
  "favicon_url",
] as const;

export async function getAppearanceSettingsRaw(): Promise<Record<string, string>> {
  const d = db();
  const rows = await d
    .select({ key: siteConfig.key, value: siteConfig.value })
    .from(siteConfig)
    .where(inArray(siteConfig.key, [...APPEARANCE_KEYS]));
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

const SEO_KEYS = [
  "seo_description",
  "seo_keywords",
  "seo_og_image",
  "seo_twitter_handle",
  "seo_google_verification",
  "seo_organization_type",
  "seo_organization_description",
  // Per-page overrides
  "seo_title_home",
  "seo_description_home",
  "seo_og_image_home",
  "seo_title_about",
  "seo_description_about",
  "seo_og_image_about",
  "seo_title_airport",
  "seo_description_airport",
  "seo_og_image_airport",
  "seo_title_initiatives",
  "seo_description_initiatives",
  "seo_og_image_initiatives",
] as const;

export async function getSeoSettingsRaw(): Promise<Record<string, string>> {
  const d = db();
  const rows = await d
    .select({ key: siteConfig.key, value: siteConfig.value })
    .from(siteConfig)
    .where(inArray(siteConfig.key, [...SEO_KEYS]));
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getGcsSettingsRaw(): Promise<Record<string, string>> {
  const d = db();
  const rows = await d
    .select({ key: siteConfig.key, value: siteConfig.value })
    .from(siteConfig)
    .where(inArray(siteConfig.key, [...GCS_KEYS]));

  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

// Gmail config
const GMAIL_KEYS = [
  "gmail_client_id",
  "gmail_client_secret",
  "gmail_notification_to",
  "gmail_access_token",
  "gmail_refresh_token",
  "gmail_token_expiry",
  "gmail_user_email",
] as const;

export async function getGmailConfig(): Promise<GmailConfig | null> {
  const d = db();
  const rows = await d
    .select({ key: siteConfig.key, value: siteConfig.value })
    .from(siteConfig)
    .where(inArray(siteConfig.key, [...GMAIL_KEYS]));

  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  if (
    !map.gmail_client_id ||
    !map.gmail_client_secret ||
    !map.gmail_notification_to ||
    !map.gmail_access_token ||
    !map.gmail_refresh_token
  ) {
    return null;
  }

  return {
    clientId: map.gmail_client_id,
    clientSecret: map.gmail_client_secret,
    notificationTo: map.gmail_notification_to,
    accessToken: map.gmail_access_token,
    refreshToken: map.gmail_refresh_token,
    tokenExpiry: map.gmail_token_expiry || "0",
    userEmail: map.gmail_user_email || "",
  };
}

export async function getGmailSettingsRaw(): Promise<Record<string, string>> {
  const d = db();
  const rows = await d
    .select({ key: siteConfig.key, value: siteConfig.value })
    .from(siteConfig)
    .where(inArray(siteConfig.key, [...GMAIL_KEYS]));

  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

/** Returns just client_id + client_secret for OAuth flow */
export async function getGmailCredentialsRaw(): Promise<Record<string, string>> {
  const d = db();
  const rows = await d
    .select({ key: siteConfig.key, value: siteConfig.value })
    .from(siteConfig)
    .where(inArray(siteConfig.key, ["gmail_client_id", "gmail_client_secret"]));

  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getAllUsers() {
  const result = await db()
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      passwordHash: users.passwordHash,
      emailVerified: users.emailVerified,
      activatedAt: users.activatedAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);

  // Convert passwordHash to boolean flag — never leak hashes to client
  return result.map(({ passwordHash, ...rest }) => ({
    ...rest,
    hasPassword: !!passwordHash,
  }));
}
