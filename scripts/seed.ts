import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hashSync } from "bcryptjs";
import { stats, initiatives, leadership, siteConfig, pageSections, users } from "../src/db/schema";

async function seed() {
  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  console.log("Seeding database...");

  // Site config
  await db.insert(siteConfig).values([
    { key: "site_name", value: "Panhandle Aviation Alliance" },
    { key: "tagline", value: "Western Nebraska Aviation Advocacy" },
    { key: "contact_email", value: "info@panhandleaviationalliance.org" },
    { key: "location", value: "Scottsbluff, Nebraska" },
  ]).onConflictDoNothing();
  console.log("  Site config seeded");

  // Stats
  await db.insert(stats).values([
    { label: "Annual Enplanements", value: "8,213", numericValue: 8213, source: "FAA", sourceUrl: "https://www.faa.gov/airports/planning_capacity/passenger_allcargo_stats/passenger", year: 2023, category: "airport", orderIndex: 0 },
    { label: "Annual Operations", value: "18,500", numericValue: 18500, source: "FAA", sourceUrl: "https://www.gcr1.com/5010web/airport.cfm?Site=BFF", year: 2023, category: "airport", orderIndex: 1 },
    { label: "Economic Impact", value: "$28M", numericValue: 28, prefix: "$", suffix: "M", source: "NDOT", sourceUrl: "https://dot.nebraska.gov/aeronautics/", year: 2023, category: "economic", orderIndex: 2 },
    { label: "Jobs Supported", value: "230+", numericValue: 230, suffix: "+", source: "NDOT", year: 2023, category: "economic", orderIndex: 3 },
    { label: "EAS Annual Subsidy", value: "$3.2M", numericValue: 3200000, prefix: "$", suffix: "M", source: "U.S. DOT", sourceUrl: "https://www.transportation.gov/policy/aviation-policy/small-community-rural-air-service/essential-air-service", year: 2023, category: "eas", orderIndex: 4 },
    { label: "Service Area Population", value: "95,000+", numericValue: 95000, suffix: "+", source: "U.S. Census", sourceUrl: "https://data.census.gov", year: 2020, category: "regional", orderIndex: 5 },
    { label: "Based Aircraft", value: "42", numericValue: 42, source: "FAA", year: 2023, category: "airport", orderIndex: 6 },
    { label: "Primary Runway", value: "8,009 ft", numericValue: 8009, suffix: " ft", source: "FAA", year: 2023, category: "infrastructure", orderIndex: 7 },
    { label: "Airport Elevation", value: "3,967 ft", numericValue: 3967, suffix: " ft MSL", source: "FAA", year: 2023, category: "infrastructure", orderIndex: 8 },
  ]).onConflictDoNothing();
  console.log("  Stats seeded");

  // Initiatives
  await db.insert(initiatives).values([
    { title: "Air Service Retention", description: "Working with the DOT and airline partners to maintain and improve Essential Air Service connections to Denver.", icon: "plane", status: "active", category: "air-service", orderIndex: 0 },
    { title: "Infrastructure Modernization", description: "Advocating for runway, terminal, and navigational aid improvements at KBFF.", icon: "building", status: "active", category: "infrastructure", orderIndex: 1 },
    { title: "Economic Development", description: "Demonstrating aviation's role as an economic engine for the Panhandle region.", icon: "chart", status: "active", category: "economic", orderIndex: 2 },
    { title: "Community Engagement", description: "Building public support for aviation through education, events, and outreach.", icon: "users", status: "active", category: "community", orderIndex: 3 },
  ]).onConflictDoNothing();
  console.log("  Initiatives seeded");

  // Leadership (placeholder — populate with real data when available)
  await db.insert(leadership).values([
    { name: "To Be Announced", title: "Chair", organization: "Panhandle Aviation Alliance", bio: "Leadership positions are being filled as the organization formalizes.", orderIndex: 0 },
  ]).onConflictDoNothing();
  console.log("  Leadership seeded");

  // Page sections
  await db.insert(pageSections).values([
    { pageSlug: "about", sectionSlug: "mission", title: "Mission", content: "To advocate for the continued investment in, and improvement of, aviation infrastructure and air service in the Nebraska Panhandle region.", orderIndex: 0 },
    { pageSlug: "about", sectionSlug: "vision", title: "Vision", content: "A Western Nebraska where reliable, affordable air service connects our communities to the world.", orderIndex: 1 },
    { pageSlug: "airport", sectionSlug: "overview", title: "Airport Overview", content: "Western Nebraska Regional Airport (KBFF) is the primary commercial aviation facility for the Nebraska Panhandle.", orderIndex: 0 },
  ]).onConflictDoNothing();
  console.log("  Page sections seeded");

  // Admin user
  const defaultPassword = "changeme123!";
  const passwordHash = hashSync(defaultPassword, 12);
  await db.insert(users).values({
    name: "Admin",
    email: "admin@panhandleaviationalliance.org",
    passwordHash,
    role: "admin",
  }).onConflictDoNothing();
  console.log("  Admin user seeded");
  console.log("  ⚠️  Default credentials: admin@panhandleaviationalliance.org / changeme123!");
  console.log("  ⚠️  Change the password after first login!");

  console.log("Seeding complete!");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
