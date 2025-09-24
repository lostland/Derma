import { type Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import {
  insertInquirySchema,
  insertServiceTypeSchema,
  insertAppointmentSchema,
} from "@shared/schema";

const ADMIN_USER = { username: "admin", password: "1234" } as { username: string; password: string };

export function registerRoutes(app: Express) {
  const server = createServer(app);


  // --- Admin Auth Routes ---
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body || {};
      // TODO: replace with secure storage/env validation
      if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
        res.cookie("admin_auth", "1", { httpOnly: true, sameSite: "lax", path: "/" });
        return res.json({ success: true });
      }
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/me", async (req, res) => {
    try {
      const isAuthed = !!(req.cookies && req.cookies["admin_auth"] === "1");
      res.json({ authenticated: isAuthed });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/logout", async (_req, res) => {
    try {
      res.clearCookie("admin_auth", { path: "/" });
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });
  // Inquiry routes
  app.post("/api/inquiries", async (req, res) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(validatedData);
      res.json(inquiry);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/inquiries", async (req, res) => {
    try {
      const inquiries = await storage.getAllInquiries();
      res.json(inquiries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/inquiries/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await storage.updateInquiryStatus(id, status);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Service type routes
  app.get("/api/service-types", async (req, res) => {
    try {
      const serviceTypes = await storage.getAllServiceTypes();
      res.json(serviceTypes);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/service-types", async (req, res) => {
    try {
      const validatedData = insertServiceTypeSchema.parse(req.body);
      const serviceType = await storage.createServiceType(validatedData);
      res.json(serviceType);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Appointment routes
  app.post("/api/appointments", async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.json(appointment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/appointments", async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/appointments/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const appointments = await storage.getAppointmentsByDate(date);
      res.json(appointments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/appointments/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await storage.updateAppointmentStatus(id, status);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });


  app.post("/api/admin/change-password", async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body || {};
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: "필수 항목이 누락되었습니다." });
      }
      if (currentPassword !== ADMIN_USER.password) {
        return res.status(401).json({ success: false, message: "현재 비밀번호가 일치하지 않습니다." });
      }
      ADMIN_USER.password = newPassword;
      return res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Naver Map API routes
  app.get("/api/naver/client-id", (req, res) => {
    try {
      const clientId = process.env.NAVER_CLIENT_ID || "454vo4765n"; // Default fallback
      res.json({ clientId });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/naver/reverse-geocode", async (req, res) => {
    try {
      const { coords } = req.query;
      if (!coords) {
        return res.status(400).json({ message: "coords parameter is required" });
      }

      const clientId = process.env.NAVER_CLIENT_ID || "454vo4765n";
      const clientSecret = process.env.NAVER_CLIENT_SECRET || "";
      
      const response = await fetch(
        `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${coords}&output=json&orders=roadaddr`,
        {
          headers: {
            'X-NCP-APIGW-API-KEY-ID': clientId,
            'X-NCP-APIGW-API-KEY': clientSecret,
          },
        }
      );

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/naver/geocoding", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query) {
        return res.status(400).json({ message: "query parameter is required" });
      }

      const clientId = process.env.NAVER_CLIENT_ID || "454vo4765n";
      const clientSecret = process.env.NAVER_CLIENT_SECRET || "";

      const response = await fetch(
        `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(query as string)}`,
        {
          headers: {
            'X-NCP-APIGW-API-KEY-ID': clientId,
            'X-NCP-APIGW-API-KEY': clientSecret,
          },
        }
      );

      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return server;
}
