import { getDb } from "@/db";
import { stats, initiatives, leadership, partners, pageSections, siteConfig } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

// Fallback data for when DB is unreachable
const FALLBACK_STATS = [
  { id: 1, label: "Annual Enplanements", value: "8,213", numericValue: 8213, prefix: null, suffix: null, source: "FAA", sourceUrl: null, year: 2023, category: "airport", orderIndex: 0, updatedAt: new Date() },
  { id: 2, label: "Annual Operations", value: "18,500", numericValue: 18500, prefix: null, suffix: null, source: "FAA", sourceUrl: null, year: 2023, category: "airport", orderIndex: 1, updatedAt: new Date() },
  { id: 3, label: "Economic Impact", value: "$28M", numericValue: 28000000, prefix: "$", suffix: "M", source: "NDOT", sourceUrl: null, year: 2023, category: "economic", orderIndex: 2, updatedAt: new Date() },
  { id: 4, label: "Jobs Supported", value: "230", numericValue: 230, prefix: null, suffix: null, source: "NDOT", sourceUrl: null, year: 2023, category: "economic", orderIndex: 3, updatedAt: new Date() },
  { id: 5, label: "EAS Subsidy", value: "$3.2M", numericValue: 3200000, prefix: "$", suffix: "M", source: "DOT", sourceUrl: null, year: 2023, category: "eas", orderIndex: 4, updatedAt: new Date() },
  { id: 6, label: "Service Area Population", value: "95,000", numericValue: 95000, prefix: null, suffix: null, source: "Census", sourceUrl: null, year: 2020, category: "regional", orderIndex: 5, updatedAt: new Date() },
];

const FALLBACK_INITIATIVES = [
  { id: 1, title: "Air Service Retention", description: "Working with the DOT and airline partners to maintain and improve Essential Air Service connections to Denver.", icon: "plane", status: "active", category: "air-service", orderIndex: 0, updatedAt: new Date() },
  { id: 2, title: "Infrastructure Modernization", description: "Advocating for runway, terminal, and navigational aid improvements at KBFF.", icon: "building", status: "active", category: "infrastructure", orderIndex: 1, updatedAt: new Date() },
  { id: 3, title: "Economic Development", description: "Demonstrating aviation's role as an economic engine for the Panhandle region.", icon: "chart", status: "active", category: "economic", orderIndex: 2, updatedAt: new Date() },
  { id: 4, title: "Community Engagement", description: "Building public support for aviation through education, events, and outreach.", icon: "users", status: "active", category: "community", orderIndex: 3, updatedAt: new Date() },
];

export async function getStats() {
  try {
    const rows = await getDb()!.select().from(stats).orderBy(asc(stats.orderIndex));
    return rows.length > 0 ? rows : FALLBACK_STATS;
  } catch {
    return FALLBACK_STATS;
  }
}

export async function getInitiatives() {
  try {
    const rows = await getDb()!.select().from(initiatives).orderBy(asc(initiatives.orderIndex));
    return rows.length > 0 ? rows : FALLBACK_INITIATIVES;
  } catch {
    return FALLBACK_INITIATIVES;
  }
}

export async function getLeadership() {
  try {
    return await getDb()!.select().from(leadership).orderBy(asc(leadership.orderIndex));
  } catch {
    return [];
  }
}

export async function getPartners() {
  try {
    return await getDb()!.select().from(partners).orderBy(asc(partners.orderIndex));
  } catch {
    return [];
  }
}

export async function getPageSections(pageSlug: string) {
  try {
    return await getDb()!
      .select()
      .from(pageSections)
      .where(eq(pageSections.pageSlug, pageSlug))
      .orderBy(asc(pageSections.orderIndex));
  } catch {
    return [];
  }
}

export async function getSiteConfig() {
  try {
    const rows = await getDb()!.select().from(siteConfig);
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    return {};
  }
}
