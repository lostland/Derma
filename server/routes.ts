import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertInquirySchema, insertAppointmentSchema, insertServiceTypeSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Contact form submission
  app.post('/api/inquiries', async (req, res) => {
    try {
      const validatedData = insertInquirySchema.parse(req.body);
      const inquiry = await storage.createInquiry(validatedData);
      res.status(201).json({ message: "문의가 접수되었습니다.", id: inquiry.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "입력 데이터가 유효하지 않습니다.", errors: error.errors });
      } else {
        console.error("Error creating inquiry:", error);
        res.status(500).json({ message: "문의 접수 중 오류가 발생했습니다." });
      }
    }
  });

  // Get all inquiries (admin only)
  app.get('/api/inquiries', isAuthenticated, async (req, res) => {
    try {
      const inquiries = await storage.getAllInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "문의 내역을 불러오는 중 오류가 발생했습니다." });
    }
  });

  // Update inquiry status (admin only)
  app.patch('/api/inquiries/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await storage.updateInquiryStatus(id, status);
      res.json({ message: "상태가 업데이트되었습니다." });
    } catch (error) {
      console.error("Error updating inquiry status:", error);
      res.status(500).json({ message: "상태 업데이트 중 오류가 발생했습니다." });
    }
  });

  // Service types routes
  app.get('/api/service-types', async (req, res) => {
    try {
      const serviceTypes = await storage.getAllServiceTypes();
      res.json(serviceTypes);
    } catch (error) {
      console.error("Error fetching service types:", error);
      res.status(500).json({ message: "서비스 유형을 불러오는 중 오류가 발생했습니다." });
    }
  });

  app.post('/api/service-types', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertServiceTypeSchema.parse(req.body);
      const serviceType = await storage.createServiceType(validatedData);
      res.status(201).json(serviceType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "입력 데이터가 유효하지 않습니다.", errors: error.errors });
      } else {
        console.error("Error creating service type:", error);
        res.status(500).json({ message: "서비스 유형 생성 중 오류가 발생했습니다." });
      }
    }
  });

  // Appointment routes
  app.post('/api/appointments', async (req, res) => {
    try {
      const validatedData = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(validatedData);
      res.status(201).json({ message: "예약이 접수되었습니다.", id: appointment.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "입력 데이터가 유효하지 않습니다.", errors: error.errors });
      } else {
        console.error("Error creating appointment:", error);
        res.status(500).json({ message: "예약 접수 중 오류가 발생했습니다." });
      }
    }
  });

  app.get('/api/appointments', isAuthenticated, async (req, res) => {
    try {
      const appointments = await storage.getAllAppointments();
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(500).json({ message: "예약 내역을 불러오는 중 오류가 발생했습니다." });
    }
  });

  app.get('/api/appointments/date/:date', async (req, res) => {
    try {
      const { date } = req.params;
      const appointments = await storage.getAppointmentsByDate(date);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments by date:", error);
      res.status(500).json({ message: "해당 날짜의 예약을 불러오는 중 오류가 발생했습니다." });
    }
  });

  app.patch('/api/appointments/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      await storage.updateAppointmentStatus(id, status);
      res.json({ message: "예약 상태가 업데이트되었습니다." });
    } catch (error) {
      console.error("Error updating appointment status:", error);
      res.status(500).json({ message: "예약 상태 업데이트 중 오류가 발생했습니다." });
    }
  });

  // Naver Maps API proxy endpoints
  app.get('/api/naver/geocode', async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Query parameter is required (must be a string)", details: null });
      }

      const trimmedQuery = query.trim();
      if (!trimmedQuery || trimmedQuery.length > 200) {
        return res.status(400).json({ message: "Query must be between 1-200 characters", details: null });
      }

      const clientId = process.env.NAVER_MAP_CLIENT_ID;
      const clientSecret = process.env.NAVER_MAP_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return res.status(500).json({ message: "Naver Maps API credentials not configured", details: null });
      }

      const naverApiUrl = `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(trimmedQuery)}`;
      
      const response = await fetch(naverApiUrl, {
        headers: {
          'X-NCP-APIGW-API-KEY-ID': clientId,
          'X-NCP-APIGW-API-KEY': clientSecret,
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          const errorData = await response.json().catch(() => ({}));
          return res.status(400).json({ 
            message: "잘못된 요청입니다.", 
            details: errorData.message || `Naver API error: ${response.status}`
          });
        }
        if (response.status >= 500) {
          return res.status(502).json({
            message: "업스트림 서비스 오류입니다.",
            details: `Naver API error: ${response.status}`
          });
        }
        throw new Error(`Naver API error: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error geocoding with Naver API:", error);
      
      if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
        return res.status(504).json({ 
          message: "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.", 
          details: null 
        });
      }
      
      // Network/connectivity errors should be 502, not 500
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return res.status(502).json({ 
          message: "네트워크 연결 오류입니다.", 
          details: null 
        });
      }
      
      res.status(500).json({ 
        message: "주소 검색 중 오류가 발생했습니다.", 
        details: null 
      });
    }
  });

  app.get('/api/naver/reverse-geocode', async (req, res) => {
    try {
      const { coords } = req.query;
      if (!coords || typeof coords !== 'string') {
        return res.status(400).json({ message: "Coords parameter is required (format: lng,lat)", details: null });
      }

      // Validate coords format (lng,lat)
      const coordsPattern = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;
      if (!coordsPattern.test(coords)) {
        return res.status(400).json({ message: "Invalid coords format. Expected: lng,lat", details: null });
      }

      const clientId = process.env.NAVER_MAP_CLIENT_ID;
      const clientSecret = process.env.NAVER_MAP_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        return res.status(500).json({ message: "Naver Maps API credentials not configured", details: null });
      }

      const naverApiUrl = `https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords=${encodeURIComponent(coords)}&sourcecrs=epsg:4326&orders=roadaddr,addr,admcode,legalcode&output=json`;
      
      const response = await fetch(naverApiUrl, {
        headers: {
          'X-NCP-APIGW-API-KEY-ID': clientId,
          'X-NCP-APIGW-API-KEY': clientSecret,
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          const errorData = await response.json().catch(() => ({}));
          return res.status(400).json({ 
            message: "잘못된 요청입니다.", 
            details: errorData.message || `Naver API error: ${response.status}`
          });
        }
        if (response.status >= 500) {
          return res.status(502).json({
            message: "업스트림 서비스 오류입니다.",
            details: `Naver API error: ${response.status}`
          });
        }
        throw new Error(`Naver API error: ${response.status}`);
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error reverse geocoding with Naver API:", error);
      
      if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
        return res.status(504).json({ 
          message: "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.", 
          details: null 
        });
      }
      
      // Network/connectivity errors should be 502, not 500
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return res.status(502).json({ 
          message: "네트워크 연결 오류입니다.", 
          details: null 
        });
      }
      
      res.status(500).json({ 
        message: "좌표를 주소로 변환하는 중 오류가 발생했습니다.", 
        details: null 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
