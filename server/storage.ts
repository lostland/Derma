import {
  users,
  inquiries,
  type User,
  type UpsertUser,
  type Inquiry,
  type InsertInquiry,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Inquiry operations
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getAllInquiries(): Promise<Inquiry[]>;
  updateInquiryStatus(id: string, status: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Inquiry operations
  async createInquiry(inquiryData: InsertInquiry): Promise<Inquiry> {
    const [inquiry] = await db
      .insert(inquiries)
      .values(inquiryData)
      .returning();
    return inquiry;
  }

  async getAllInquiries(): Promise<Inquiry[]> {
    return await db
      .select()
      .from(inquiries)
      .orderBy(desc(inquiries.createdAt));
  }

  async updateInquiryStatus(id: string, status: string): Promise<void> {
    await db
      .update(inquiries)
      .set({ status })
      .where(eq(inquiries.id, id));
  }
}

export const storage = new DatabaseStorage();
