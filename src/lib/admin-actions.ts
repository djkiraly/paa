"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { auth } from "@/lib/auth";
import { hash } from "bcryptjs";
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
import { getGcsConfig, getGmailConfig } from "@/lib/admin-queries";
import { testGcsConnection } from "@/lib/gcs";
import {
  testGmailConnection,
  sendActivationEmail,
  sendVerificationEmail,
  sendApprovalEmail,
  sendNewRegistrationNotification,
} from "@/lib/gmail";
import { isNotNull } from "drizzle-orm";
import { randomUUID } from "crypto";
import { and, isNull } from "drizzle-orm";

function db() {
  const d = getDb();
  if (!d) throw new Error("Database not configured");
  return d;
}

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

// SEO Settings
export async function saveSeoSettings(formData: FormData) {
  await requireAuth();
  const d = db();

  const keys = [
    "seo_description", "seo_keywords", "seo_og_image",
    "seo_twitter_handle", "seo_google_verification",
    "seo_organization_type", "seo_organization_description",
    "seo_title_home", "seo_description_home", "seo_og_image_home",
    "seo_title_about", "seo_description_about", "seo_og_image_about",
    "seo_title_airport", "seo_description_airport", "seo_og_image_airport",
    "seo_title_initiatives", "seo_description_initiatives", "seo_og_image_initiatives",
  ] as const;

  for (const key of keys) {
    const value = (formData.get(key) as string)?.trim() || "";
    if (value) {
      await d
        .insert(siteConfig)
        .values({ key, value })
        .onConflictDoUpdate({ target: siteConfig.key, set: { value, updatedAt: new Date() } });
    } else {
      await d.delete(siteConfig).where(eq(siteConfig.key, key));
    }
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/airport");
  revalidatePath("/initiatives");
}

// Appearance Settings
export async function saveAppearanceSettings(formData: FormData) {
  await requireAuth();
  const d = db();

  const keys = [
    "theme_midnight", "theme_navy", "theme_slate",
    "theme_accent", "theme_accent_light", "theme_accent_dark",
    "theme_sky", "theme_sky_light", "theme_white", "theme_gray",
    "logo_url", "favicon_url",
  ] as const;

  for (const key of keys) {
    const value = (formData.get(key) as string)?.trim() || "";
    if (value) {
      await d
        .insert(siteConfig)
        .values({ key, value })
        .onConflictDoUpdate({ target: siteConfig.key, set: { value, updatedAt: new Date() } });
    } else {
      // Empty = use default, remove override
      await d.delete(siteConfig).where(eq(siteConfig.key, key));
    }
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/airport");
  revalidatePath("/initiatives");
}

// General Settings
export async function saveGeneralSettings(formData: FormData) {
  await requireAuth();
  const d = db();

  const keys = ["site_name", "tagline", "contact_email", "location"] as const;
  for (const key of keys) {
    const value = (formData.get(key) as string)?.trim() || "";
    await d
      .insert(siteConfig)
      .values({ key, value })
      .onConflictDoUpdate({ target: siteConfig.key, set: { value, updatedAt: new Date() } });
  }

  revalidatePath("/admin/settings");
  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/airport");
  revalidatePath("/initiatives");
}

// GCS Settings
export async function saveGcsSettings(formData: FormData) {
  await requireAuth();
  const d = db();

  const entries: { key: string; value: string }[] = [];
  const projectId = formData.get("gcs_project_id") as string;
  const bucketName = formData.get("gcs_bucket_name") as string;
  const credentials = formData.get("gcs_credentials") as string;
  const cdnBaseUrl = formData.get("gcs_cdn_base_url") as string;

  if (projectId) entries.push({ key: "gcs_project_id", value: projectId });
  if (bucketName) entries.push({ key: "gcs_bucket_name", value: bucketName });
  if (credentials) entries.push({ key: "gcs_credentials", value: credentials });
  if (cdnBaseUrl) {
    entries.push({ key: "gcs_cdn_base_url", value: cdnBaseUrl });
  }

  for (const { key, value } of entries) {
    await d
      .insert(siteConfig)
      .values({ key, value })
      .onConflictDoUpdate({ target: siteConfig.key, set: { value, updatedAt: new Date() } });
  }

  revalidatePath("/admin/settings");
}

export async function testGcsConnectionAction(): Promise<{ ok: boolean; error?: string }> {
  await requireAuth();
  const config = await getGcsConfig();
  if (!config) {
    return { ok: false, error: "GCS not configured. Save settings first." };
  }
  return testGcsConnection(config);
}

// Gmail Settings
export async function saveGmailSettings(formData: FormData) {
  await requireAuth();
  const d = db();

  const entries: { key: string; value: string }[] = [];
  const clientId = formData.get("gmail_client_id") as string;
  const clientSecret = formData.get("gmail_client_secret") as string;
  const notificationTo = formData.get("gmail_notification_to") as string;

  if (clientId) entries.push({ key: "gmail_client_id", value: clientId });
  if (clientSecret) entries.push({ key: "gmail_client_secret", value: clientSecret });
  if (notificationTo) entries.push({ key: "gmail_notification_to", value: notificationTo });

  for (const { key, value } of entries) {
    await d
      .insert(siteConfig)
      .values({ key, value })
      .onConflictDoUpdate({ target: siteConfig.key, set: { value, updatedAt: new Date() } });
  }

  revalidatePath("/admin/settings");
}

export async function testGmailConnectionAction(): Promise<{ ok: boolean; error?: string }> {
  await requireAuth();
  const config = await getGmailConfig();
  if (!config) {
    return { ok: false, error: "Gmail not fully configured. Save credentials and connect your account first." };
  }
  try {
    return await testGmailConnection(config);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    const lower = msg.toLowerCase();
    if (lower.includes("insufficient") || lower.includes("scope")) {
      return { ok: false, error: "Insufficient authentication scopes. Enable the Gmail API in Google Cloud Console (APIs & Services → Library → Gmail API), then disconnect and reconnect." };
    }
    if (lower.includes("invalid_grant") || lower.includes("token")) {
      return { ok: false, error: "Token expired or revoked. Disconnect and reconnect Gmail." };
    }
    if (lower.includes("enotfound") || lower.includes("network") || lower.includes("fetch")) {
      return { ok: false, error: "Could not reach Gmail API. Check server network connectivity." };
    }
    return { ok: false, error: msg };
  }
}

export async function disconnectGmail(): Promise<void> {
  await requireAuth();
  const d = db();
  const tokenKeys = [
    "gmail_access_token",
    "gmail_refresh_token",
    "gmail_token_expiry",
    "gmail_user_email",
  ];
  for (const key of tokenKeys) {
    await d.delete(siteConfig).where(eq(siteConfig.key, key));
  }
  revalidatePath("/admin/settings");
}

// Stats CRUD
export async function createStat(formData: FormData) {
  await requireAuth();
  const d = db();
  await d.insert(stats).values({
    label: formData.get("label") as string,
    value: formData.get("value") as string,
    numericValue: formData.get("numericValue")
      ? Number(formData.get("numericValue"))
      : null,
    prefix: (formData.get("prefix") as string) || null,
    suffix: (formData.get("suffix") as string) || null,
    source: (formData.get("source") as string) || null,
    sourceUrl: (formData.get("sourceUrl") as string) || null,
    year: formData.get("year") ? Number(formData.get("year")) : null,
    category: (formData.get("category") as string) || "airport",
    orderIndex: Number(formData.get("orderIndex") || 0),
  });
  revalidatePath("/admin/stats");
  revalidatePath("/");
}

export async function updateStat(formData: FormData) {
  await requireAuth();
  const d = db();
  const id = Number(formData.get("id"));
  await d
    .update(stats)
    .set({
      label: formData.get("label") as string,
      value: formData.get("value") as string,
      numericValue: formData.get("numericValue")
        ? Number(formData.get("numericValue"))
        : null,
      prefix: (formData.get("prefix") as string) || null,
      suffix: (formData.get("suffix") as string) || null,
      source: (formData.get("source") as string) || null,
      sourceUrl: (formData.get("sourceUrl") as string) || null,
      year: formData.get("year") ? Number(formData.get("year")) : null,
      category: (formData.get("category") as string) || "airport",
      orderIndex: Number(formData.get("orderIndex") || 0),
      updatedAt: new Date(),
    })
    .where(eq(stats.id, id));
  revalidatePath("/admin/stats");
  revalidatePath("/");
}

export async function deleteStat(id: number) {
  await requireAuth();
  await db().delete(stats).where(eq(stats.id, id));
  revalidatePath("/admin/stats");
  revalidatePath("/");
}

// Initiatives CRUD
export async function createInitiative(formData: FormData) {
  await requireAuth();
  await db().insert(initiatives).values({
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    icon: (formData.get("icon") as string) || null,
    status: (formData.get("status") as string) || "active",
    category: (formData.get("category") as string) || null,
    orderIndex: Number(formData.get("orderIndex") || 0),
  });
  revalidatePath("/admin/initiatives");
  revalidatePath("/");
}

export async function updateInitiative(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  await db()
    .update(initiatives)
    .set({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      icon: (formData.get("icon") as string) || null,
      status: (formData.get("status") as string) || "active",
      category: (formData.get("category") as string) || null,
      orderIndex: Number(formData.get("orderIndex") || 0),
      updatedAt: new Date(),
    })
    .where(eq(initiatives.id, id));
  revalidatePath("/admin/initiatives");
  revalidatePath("/");
}

export async function deleteInitiative(id: number) {
  await requireAuth();
  await db().delete(initiatives).where(eq(initiatives.id, id));
  revalidatePath("/admin/initiatives");
  revalidatePath("/");
}

// Leadership CRUD
export async function createLeader(formData: FormData) {
  await requireAuth();
  await db().insert(leadership).values({
    name: formData.get("name") as string,
    title: formData.get("title") as string,
    organization: (formData.get("organization") as string) || null,
    bio: (formData.get("bio") as string) || null,
    imageUrl: (formData.get("imageUrl") as string) || null,
    orderIndex: Number(formData.get("orderIndex") || 0),
  });
  revalidatePath("/admin/leadership");
  revalidatePath("/about");
}

export async function updateLeader(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  await db()
    .update(leadership)
    .set({
      name: formData.get("name") as string,
      title: formData.get("title") as string,
      organization: (formData.get("organization") as string) || null,
      bio: (formData.get("bio") as string) || null,
      imageUrl: (formData.get("imageUrl") as string) || null,
      orderIndex: Number(formData.get("orderIndex") || 0),
      updatedAt: new Date(),
    })
    .where(eq(leadership.id, id));
  revalidatePath("/admin/leadership");
  revalidatePath("/about");
}

export async function deleteLeader(id: number) {
  await requireAuth();
  await db().delete(leadership).where(eq(leadership.id, id));
  revalidatePath("/admin/leadership");
  revalidatePath("/about");
}

// Partners CRUD
export async function createPartner(formData: FormData) {
  await requireAuth();
  await db().insert(partners).values({
    name: formData.get("name") as string,
    logoUrl: (formData.get("logoUrl") as string) || null,
    websiteUrl: (formData.get("websiteUrl") as string) || null,
    tier: (formData.get("tier") as string) || "supporter",
    orderIndex: Number(formData.get("orderIndex") || 0),
  });
  revalidatePath("/admin/partners");
  revalidatePath("/");
}

export async function updatePartner(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  await db()
    .update(partners)
    .set({
      name: formData.get("name") as string,
      logoUrl: (formData.get("logoUrl") as string) || null,
      websiteUrl: (formData.get("websiteUrl") as string) || null,
      tier: (formData.get("tier") as string) || "supporter",
      orderIndex: Number(formData.get("orderIndex") || 0),
      updatedAt: new Date(),
    })
    .where(eq(partners.id, id));
  revalidatePath("/admin/partners");
  revalidatePath("/");
}

export async function deletePartner(id: number) {
  await requireAuth();
  await db().delete(partners).where(eq(partners.id, id));
  revalidatePath("/admin/partners");
  revalidatePath("/");
}

// Sections CRUD
export async function createSection(formData: FormData) {
  await requireAuth();
  await db().insert(pageSections).values({
    pageSlug: formData.get("pageSlug") as string,
    sectionSlug: formData.get("sectionSlug") as string,
    title: (formData.get("title") as string) || null,
    subtitle: (formData.get("subtitle") as string) || null,
    content: (formData.get("content") as string) || null,
    orderIndex: Number(formData.get("orderIndex") || 0),
  });
  revalidatePath("/admin/sections");
}

export async function updateSection(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  await db()
    .update(pageSections)
    .set({
      pageSlug: formData.get("pageSlug") as string,
      sectionSlug: formData.get("sectionSlug") as string,
      title: (formData.get("title") as string) || null,
      subtitle: (formData.get("subtitle") as string) || null,
      content: (formData.get("content") as string) || null,
      orderIndex: Number(formData.get("orderIndex") || 0),
      updatedAt: new Date(),
    })
    .where(eq(pageSections.id, id));
  revalidatePath("/admin/sections");
}

export async function deleteSection(id: number) {
  await requireAuth();
  await db().delete(pageSections).where(eq(pageSections.id, id));
  revalidatePath("/admin/sections");
}

// Contacts
export async function markContactRead(id: number) {
  await requireAuth();
  await db()
    .update(contactSubmissions)
    .set({ read: true })
    .where(eq(contactSubmissions.id, id));
  revalidatePath("/admin/contacts");
}

export async function deleteContact(id: number) {
  await requireAuth();
  await db().delete(contactSubmissions).where(eq(contactSubmissions.id, id));
  revalidatePath("/admin/contacts");
}

// Tenants CRUD
export async function createTenant(formData: FormData) {
  await requireAuth();
  await db().insert(tenants).values({
    name: formData.get("name") as string,
    hangarLocation: (formData.get("hangarLocation") as string) || null,
    address: (formData.get("address") as string) || null,
    phone: (formData.get("phone") as string) || null,
    email: (formData.get("email") as string) || null,
    orderIndex: Number(formData.get("orderIndex") || 0),
  });
  revalidatePath("/admin/tenants");
}

export async function updateTenant(formData: FormData) {
  await requireAuth();
  const id = Number(formData.get("id"));
  await db()
    .update(tenants)
    .set({
      name: formData.get("name") as string,
      hangarLocation: (formData.get("hangarLocation") as string) || null,
      address: (formData.get("address") as string) || null,
      phone: (formData.get("phone") as string) || null,
      email: (formData.get("email") as string) || null,
      orderIndex: Number(formData.get("orderIndex") || 0),
      updatedAt: new Date(),
    })
    .where(eq(tenants.id, id));
  revalidatePath("/admin/tenants");
}

export async function deleteTenant(id: number) {
  await requireAuth();
  await db().delete(tenants).where(eq(tenants.id, id));
  revalidatePath("/admin/tenants");
}

export async function bulkImportTenants(
  rows: { name: string; hangarLocation?: string; address?: string; phone?: string; email?: string }[]
): Promise<{ count: number }> {
  await requireAuth();
  const d = db();

  // Get current max orderIndex
  const existing = await d.select({ orderIndex: tenants.orderIndex }).from(tenants);
  let maxOrder = existing.length > 0 ? Math.max(...existing.map((r) => r.orderIndex)) : -1;

  const validRows = rows.filter((r) => r.name?.trim());
  if (validRows.length === 0) {
    throw new Error("No valid rows to import (each row must have a name)");
  }

  for (const row of validRows) {
    maxOrder++;
    await d.insert(tenants).values({
      name: row.name.trim(),
      hangarLocation: row.hangarLocation?.trim() || null,
      address: row.address?.trim() || null,
      phone: row.phone?.trim() || null,
      email: row.email?.trim() || null,
      orderIndex: maxOrder,
    });
  }

  revalidatePath("/admin/tenants");
  return { count: validRows.length };
}

// Users CRUD
export async function createUser(formData: FormData) {
  await requireAuth();
  const activationToken = randomUUID();
  const email = formData.get("email") as string;
  const name = (formData.get("name") as string) || null;
  await db().insert(users).values({
    name,
    email,
    role: (formData.get("role") as string) || "admin",
    activationToken,
  });

  // Send activation email (fire-and-forget)
  getGmailConfig()
    .then((config) => {
      if (config) {
        return sendActivationEmail(config, { name, email, activationToken });
      }
    })
    .catch((err) => console.error("Failed to send activation email:", err));

  revalidatePath("/admin/users");
}

export async function updateUser(formData: FormData) {
  await requireAuth();
  const id = formData.get("id") as string;
  await db()
    .update(users)
    .set({
      name: (formData.get("name") as string) || null,
      email: formData.get("email") as string,
      role: (formData.get("role") as string) || "admin",
      updatedAt: new Date(),
    })
    .where(eq(users.id, id));
  revalidatePath("/admin/users");
}

export async function resetUserPassword(formData: FormData) {
  await requireAuth();
  const id = formData.get("id") as string;
  const password = formData.get("password") as string;
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  const passwordHash = await hash(password, 12);
  await db()
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, id));
  revalidatePath("/admin/users");
}

export async function deleteUser(id: string) {
  const session = await requireAuth();
  if (session.user.id === id) {
    throw new Error("Cannot delete your own account");
  }
  await db().delete(users).where(eq(users.id, id));
  revalidatePath("/admin/users");
}

// Account Activation (NOT auth-gated — user isn't logged in yet)
export async function activateAccount(
  token: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  if (!token) return { ok: false, error: "Invalid activation link" };
  if (!password || password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }

  const d = db();
  const [user] = await d
    .select()
    .from(users)
    .where(and(eq(users.activationToken, token), isNull(users.activatedAt)))
    .limit(1);

  if (!user) return { ok: false, error: "Invalid or expired activation link" };

  // Block self-registered users from bypassing admin approval via activation endpoint
  if (user.passwordHash) {
    return { ok: false, error: "Invalid or expired activation link" };
  }

  const passwordHash = await hash(password, 12);
  await d
    .update(users)
    .set({
      passwordHash,
      emailVerified: new Date(),
      activatedAt: new Date(),
      activationToken: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  return { ok: true };
}

export async function resendActivationEmail(userId: string) {
  await requireAuth();
  const d = db();
  const [user] = await d
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new Error("User not found");
  if (user.activatedAt) throw new Error("User is already activated");

  const activationToken = randomUUID();
  await d
    .update(users)
    .set({ activationToken, updatedAt: new Date() })
    .where(eq(users.id, userId));

  const config = await getGmailConfig();
  if (config) {
    await sendActivationEmail(config, {
      name: user.name,
      email: user.email,
      activationToken,
    });
  } else {
    throw new Error("Gmail not configured — cannot send activation email");
  }

  revalidatePath("/admin/users");
}

// Public Registration (NOT auth-gated)
export async function registerAccount(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const name = (formData.get("name") as string)?.trim() || null;
  const email = (formData.get("email") as string)?.toLowerCase().trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email) return { ok: false, error: "Email is required" };
  if (!password || password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }
  if (password !== confirmPassword) {
    return { ok: false, error: "Passwords do not match" };
  }

  const d = db();

  // Check for existing user
  const [existing] = await d
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    // Already active or admin-invited
    if (existing.activatedAt || !existing.passwordHash) {
      return { ok: false, error: "An account with this email already exists" };
    }
    // Verified but awaiting approval
    if (existing.emailVerified) {
      return {
        ok: false,
        error: "An account with this email is pending approval. Please contact an administrator.",
      };
    }
    // Unverified self-registration — allow re-registration (overwrite password, resend verification)
    const passwordHash = await hash(password, 12);
    const activationToken = randomUUID();
    await d
      .update(users)
      .set({ name, passwordHash, activationToken, updatedAt: new Date() })
      .where(eq(users.id, existing.id));

    getGmailConfig()
      .then((config) => {
        if (config) {
          return sendVerificationEmail(config, { name, email, activationToken });
        }
      })
      .catch((err) => console.error("Failed to send verification email:", err));

    return { ok: true };
  }

  // New registration
  const passwordHash = await hash(password, 12);
  const activationToken = randomUUID();
  await d.insert(users).values({
    name,
    email,
    passwordHash,
    activationToken,
    role: "admin",
  });

  getGmailConfig()
    .then((config) => {
      if (config) {
        return sendVerificationEmail(config, { name, email, activationToken });
      }
    })
    .catch((err) => console.error("Failed to send verification email:", err));

  return { ok: true };
}

// Email Verification (NOT auth-gated)
export async function verifyEmail(
  token: string
): Promise<{ ok: boolean; error?: string }> {
  if (!token) return { ok: false, error: "Invalid verification link" };

  const d = db();
  const [user] = await d
    .select()
    .from(users)
    .where(
      and(
        eq(users.activationToken, token),
        isNull(users.activatedAt),
        isNotNull(users.passwordHash)
      )
    )
    .limit(1);

  if (!user) return { ok: false, error: "Invalid or expired verification link" };

  if (user.emailVerified) {
    return { ok: false, error: "Email already verified. Your account is awaiting admin approval." };
  }

  await d
    .update(users)
    .set({
      emailVerified: new Date(),
      activationToken: null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id));

  // Notify admins of new registration awaiting approval
  getGmailConfig()
    .then((config) => {
      if (config) {
        return sendNewRegistrationNotification(config, {
          name: user.name,
          email: user.email,
        });
      }
    })
    .catch((err) => console.error("Failed to send admin notification:", err));

  return { ok: true };
}

// Approve User (auth-gated)
export async function approveUser(userId: string) {
  await requireAuth();
  const d = db();

  const [user] = await d
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) throw new Error("User not found");
  if (!user.passwordHash || !user.emailVerified) {
    throw new Error("User has not completed registration and email verification");
  }
  if (user.activatedAt) throw new Error("User is already active");

  await d
    .update(users)
    .set({ activatedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, userId));

  // Send approval notification email
  getGmailConfig()
    .then((config) => {
      if (config) {
        return sendApprovalEmail(config, { name: user.name, email: user.email });
      }
    })
    .catch((err) => console.error("Failed to send approval email:", err));

  revalidatePath("/admin/users");
}

// Reject User (auth-gated — deletes the user)
export async function rejectUser(userId: string) {
  const session = await requireAuth();
  if (session.user.id === userId) {
    throw new Error("Cannot reject your own account");
  }
  await db().delete(users).where(eq(users.id, userId));
  revalidatePath("/admin/users");
}
