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
  users,
  siteConfig,
} from "@/db/schema";
import { getGcsConfig } from "@/lib/admin-queries";
import { testGcsConnection } from "@/lib/gcs";

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

// Users CRUD
export async function createUser(formData: FormData) {
  await requireAuth();
  const password = formData.get("password") as string;
  if (!password || password.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  const passwordHash = await hash(password, 12);
  await db().insert(users).values({
    name: (formData.get("name") as string) || null,
    email: formData.get("email") as string,
    passwordHash,
    role: (formData.get("role") as string) || "admin",
  });
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
