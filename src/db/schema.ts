import { pgTable, serial, text, integer, timestamp, boolean, jsonb, uuid } from "drizzle-orm/pg-core";

export const siteConfig = pgTable("site_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const pageSections = pgTable("page_sections", {
  id: serial("id").primaryKey(),
  pageSlug: text("page_slug").notNull(),
  sectionSlug: text("section_slug").notNull(),
  title: text("title"),
  subtitle: text("subtitle"),
  content: text("content"),
  orderIndex: integer("order_index").notNull().default(0),
  metadata: jsonb("metadata"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  label: text("label").notNull().unique(),
  value: text("value").notNull(),
  numericValue: integer("numeric_value"),
  prefix: text("prefix"),
  suffix: text("suffix"),
  source: text("source"),
  sourceUrl: text("source_url"),
  year: integer("year"),
  category: text("category").notNull().default("airport"),
  orderIndex: integer("order_index").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const initiatives = pgTable("initiatives", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon"),
  status: text("status").notNull().default("active"),
  category: text("category"),
  orderIndex: integer("order_index").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leadership = pgTable("leadership", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  organization: text("organization"),
  bio: text("bio"),
  imageUrl: text("image_url"),
  orderIndex: integer("order_index").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url"),
  tier: text("tier").notNull().default("supporter"),
  orderIndex: integer("order_index").notNull().default(0),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified"),
  image: text("image"),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires").notNull(),
});

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  organization: text("organization"),
  message: text("message").notNull(),
  type: text("type").notNull().default("general"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
