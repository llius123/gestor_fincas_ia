import { describe, test, expect } from "bun:test";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

// Create a test app with minimal endpoints
const createTestApp = () => {
  return new Elysia()
    .use(cors())
    .get("/", () => "Hello Elysia")
    .get("/api/health", () => ({ 
      status: "ok", 
      timestamp: new Date().toISOString() 
    }));
};

describe("Health Endpoints", () => {
  const app = createTestApp();

  describe("GET /", () => {
    test("should return hello message", async () => {
      const response = await app.handle(new Request("http://localhost/"));
      
      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe("Hello Elysia");
    });
  });

  describe("GET /api/health", () => {
    test("should return health status", async () => {
      const response = await app.handle(new Request("http://localhost/api/health"));

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body).toHaveProperty("status", "ok");
      expect(body).toHaveProperty("timestamp");
      expect(typeof body.timestamp).toBe("string");
      
      // Validate timestamp format (ISO string)
      const timestamp = new Date(body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    test("should return valid JSON content type", async () => {
      const response = await app.handle(new Request("http://localhost/api/health"));

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("application/json");
    });
  });
});