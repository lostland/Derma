import {
  users,
  inquiries,
  serviceTypes,
  appointments,
  type User,
  type UpsertUser,
  type Inquiry,
  type InsertInquiry,
  type ServiceType,
  type InsertServiceType,
  type Appointment,
  type InsertAppointment,
} from "@shared/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { getDatabaseClient } from "./db";
import { randomUUID } from "node:crypto";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Inquiry operations
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getAllInquiries(): Promise<Inquiry[]>;
  updateInquiryStatus(id: string, status: string): Promise<void>;

  // Service type operations
  getAllServiceTypes(): Promise<ServiceType[]>;
  createServiceType(serviceType: InsertServiceType): Promise<ServiceType>;

  // Appointment operations
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAllAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  updateAppointmentStatus(id: string, status: string): Promise<void>;
}

type DatabaseClient = NonNullable<ReturnType<typeof getDatabaseClient>>;

export class DatabaseStorage implements IStorage {
  constructor(private readonly db: DatabaseClient) {}

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await this.db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await this.db
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
    const [inquiry] = await this.db
      .insert(inquiries)
      .values(inquiryData)
      .returning();
    return inquiry;
  }

  async getAllInquiries(): Promise<Inquiry[]> {
    return await this.db
      .select()
      .from(inquiries)
      .orderBy(desc(inquiries.createdAt));
  }

  async updateInquiryStatus(id: string, status: string): Promise<void> {
    await this.db
      .update(inquiries)
      .set({ status })
      .where(eq(inquiries.id, id));
  }

  // Service type operations
  async getAllServiceTypes(): Promise<ServiceType[]> {
    return await this.db
      .select()
      .from(serviceTypes)
      .where(eq(serviceTypes.isActive, "active"))
      .orderBy(serviceTypes.name);
  }

  async createServiceType(serviceTypeData: InsertServiceType): Promise<ServiceType> {
    const [serviceType] = await this.db
      .insert(serviceTypes)
      .values(serviceTypeData)
      .returning();
    return serviceType;
  }

  // Appointment operations
  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const [appointment] = await this.db
      .insert(appointments)
      .values(appointmentData)
      .returning();
    return appointment;
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return await this.db
      .select()
      .from(appointments)
      .orderBy(desc(appointments.appointmentDate));
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.appointmentDate, startOfDay),
          lte(appointments.appointmentDate, endOfDay)
        )
      )
      .orderBy(appointments.appointmentDate);
  }

  async updateAppointmentStatus(id: string, status: string): Promise<void> {
    await this.db
      .update(appointments)
      .set({ status, updatedAt: new Date() })
      .where(eq(appointments.id, id));
  }
}

class InMemoryStorage implements IStorage {
  private users: User[] = [];
  private inquiries: Inquiry[] = [];
  private serviceTypes: ServiceType[] = [];
  private appointments: Appointment[] = [];

  async getUser(id: string): Promise<User | undefined> {
    return this.users.find((user) => user.id === id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    const existingIndex = userData.id
      ? this.users.findIndex((user) => user.id === userData.id)
      : -1;

    if (existingIndex >= 0) {
      const updatedUser: User = {
        ...this.users[existingIndex],
        ...userData,
        updatedAt: now,
      };
      this.users[existingIndex] = updatedUser;
      return updatedUser;
    }

    const newUser: User = {
      id: userData.id ?? randomUUID(),
      email: userData.email ?? null,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: userData.profileImageUrl ?? null,
      createdAt: now,
      updatedAt: now,
    };
    this.users.push(newUser);
    return newUser;
  }

  async createInquiry(inquiryData: InsertInquiry): Promise<Inquiry> {
    const now = new Date();
    const inquiry: Inquiry = {
      id: randomUUID(),
      name: inquiryData.name,
      phone: inquiryData.phone,
      inquiry: inquiryData.inquiry,
      createdAt: now,
      status: "new",
    };
    this.inquiries.unshift(inquiry);
    return inquiry;
  }

  async getAllInquiries(): Promise<Inquiry[]> {
    return [...this.inquiries];
  }

  async updateInquiryStatus(id: string, status: string): Promise<void> {
    const inquiry = this.inquiries.find((item) => item.id === id);
    if (inquiry) {
      inquiry.status = status;
    }
  }

  async getAllServiceTypes(): Promise<ServiceType[]> {
    return this.serviceTypes
      .filter((serviceType) => serviceType.isActive === "active")
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createServiceType(serviceTypeData: InsertServiceType): Promise<ServiceType> {
    const now = new Date();
    const serviceType: ServiceType = {
      id: randomUUID(),
      name: serviceTypeData.name,
      description: serviceTypeData.description ?? null,
      duration: serviceTypeData.duration,
      price: serviceTypeData.price ?? null,
      isActive: "active",
      createdAt: now,
    };
    this.serviceTypes.push(serviceType);
    return serviceType;
  }

  async createAppointment(appointmentData: InsertAppointment): Promise<Appointment> {
    const now = new Date();
    const rawAppointmentDate = appointmentData.appointmentDate;
    const appointmentDate =
      rawAppointmentDate instanceof Date
        ? rawAppointmentDate
        : new Date(rawAppointmentDate as unknown as string);
    const appointment: Appointment = {
      id: randomUUID(),
      name: appointmentData.name,
      phone: appointmentData.phone,
      email: appointmentData.email ?? null,
      serviceTypeId: appointmentData.serviceTypeId ?? null,
      appointmentDate,
      notes: appointmentData.notes ?? null,
      address: appointmentData.address ?? null,
      latitude: appointmentData.latitude ?? null,
      longitude: appointmentData.longitude ?? null,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    this.appointments.push(appointment);
    return appointment;
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return [...this.appointments].sort(
      (a, b) => b.appointmentDate.getTime() - a.appointmentDate.getTime()
    );
  }

  async getAppointmentsByDate(date: string): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.appointments.filter((appointment) => {
      const time = appointment.appointmentDate.getTime();
      return time >= startOfDay.getTime() && time <= endOfDay.getTime();
    });
  }

  async updateAppointmentStatus(id: string, status: string): Promise<void> {
    const appointment = this.appointments.find((item) => item.id === id);
    if (appointment) {
      appointment.status = status;
      appointment.updatedAt = new Date();
    }
  }
}

const databaseClient = getDatabaseClient();

if (!databaseClient) {
  console.warn("DATABASE_URL이 설정되지 않아 인메모리 스토리지를 사용합니다.");
}

export const storage: IStorage = databaseClient
  ? new DatabaseStorage(databaseClient)
  : new InMemoryStorage();
