import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for admin authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Contact inquiries table
export const inquiries = pgTable("inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  inquiry: text("inquiry").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  status: varchar("status", { length: 20 }).default("new"),
});

// Service types table
export const serviceTypes = pgTable("service_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // minutes
  price: decimal("price", { precision: 10, scale: 2 }),
  isActive: varchar("is_active", { length: 10 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Appointments table
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 255 }),
  serviceTypeId: varchar("service_type_id").references(() => serviceTypes.id),
  appointmentDate: timestamp("appointment_date").notNull(),
  notes: text("notes"),
  // Location information
  address: text("address"), // Full address string
  latitude: decimal("latitude", { precision: 10, scale: 8 }), // Decimal degrees
  longitude: decimal("longitude", { precision: 11, scale: 8 }), // Decimal degrees
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema exports
export const insertInquirySchema = createInsertSchema(inquiries).pick({
  name: true,
  phone: true,
  inquiry: true,
});

export const insertServiceTypeSchema = createInsertSchema(serviceTypes).pick({
  name: true,
  description: true,
  duration: true,
  price: true,
});

export const insertAppointmentSchema = createInsertSchema(appointments).pick({
  name: true,
  phone: true,
  email: true,
  serviceTypeId: true,
  appointmentDate: true,
  notes: true,
  address: true,
  latitude: true,
  longitude: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type ServiceType = typeof serviceTypes.$inferSelect;
export type InsertServiceType = z.infer<typeof insertServiceTypeSchema>;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;


// Admin credentials table
export const adminUsers = pgTable("admin_users", {
  username: varchar("username", { length: 50 }).primaryKey(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers, {
  username: z.string().min(3).max(50),
  passwordHash: z.string().min(10),
});

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = typeof adminUsers.$inferInsert;
