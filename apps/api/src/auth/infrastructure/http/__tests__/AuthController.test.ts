import { describe, test, expect, beforeEach } from "bun:test";
import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { Database } from "bun:sqlite";
import { SqliteUserRepository } from "../../repositories/SqliteUserRepository";
import { SimpleAuthenticationService } from "../../services/SimpleAuthenticationService";
import { LoginUseCase } from "../../../application/use-cases/LoginUseCase";
import { AuthController } from "../AuthController";
import { JwtAuthMiddleware } from "../../middleware/JwtAuthMiddleware";
import { LoginResponse, ErrorResponse, ProfileResponse, ValidationErrorResponse } from "./types";

// Create test database for testing
const createTestDb = () => {
  const db = new Database(":memory:");
  
  // Initialize users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Vecino',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Insert test user
  const insertUser = db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
  insertUser.run('admin', 'admin123', 'Administrador');
  
  return db;
};

// Create test app with auth endpoints
const createTestApp = (db: Database) => {
  const userRepository = new SqliteUserRepository(db);
  const authService = new SimpleAuthenticationService();
  const loginUseCase = new LoginUseCase(userRepository, authService);
  const authController = new AuthController(loginUseCase);
  const jwtMiddleware = new JwtAuthMiddleware(authService);

  return new Elysia()
    .use(cors())
    .derive(async ({ headers }) => {
      const authContext = await jwtMiddleware.authenticate(headers.authorization);
      return {
        auth: authContext
      };
    })
    .post("/api/auth/login", async ({ body, set }) => {
      const result = await authController.login(body);
      set.status = result.status;
      return result.body;
    }, {
      body: t.Object({
        username: t.String(),
        password: t.String()
      })
    })
    .get("/api/profile", ({ auth }) => {
      return {
        success: true,
        message: "Profile data retrieved successfully",
        user: auth?.user,
        timestamp: new Date().toISOString()
      };
    }, {
      ...jwtMiddleware.createProtectedHandler()
    });
};

describe("Authentication Endpoints", () => {
  let testDb: Database;
  let app: any;

  beforeEach(() => {
    testDb = createTestDb();
    app = createTestApp(testDb);
  });

  describe("POST /api/auth/login", () => {
    test("should login successfully with valid credentials", async () => {
      const response = await app.handle(new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: "admin",
          password: "admin123"
        })
      }));

      expect(response.status).toBe(200);
      const body = await response.json() as LoginResponse;
      
      expect(body).toHaveProperty("success", true);
      expect(body).toHaveProperty("message", "Login successful");
      expect(body).toHaveProperty("token");
      expect(body).toHaveProperty("user");
      expect(body.user).toHaveProperty("id");
      expect(body.user).toHaveProperty("username", "admin");
      expect(body.user).toHaveProperty("role");
      expect(typeof body.token!).toBe("string");
      expect(body.token!.length).toBeGreaterThan(0);
    });

    test("should fail with invalid username", async () => {
      const response = await app.handle(new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: "invaliduser",
          password: "admin123"
        })
      }));

      expect(response.status).toBe(401);
      const body = await response.json() as ErrorResponse;

      expect(body).toHaveProperty("success", false);
      expect(body).toHaveProperty("message", "Invalid credentials");
      expect(body).not.toHaveProperty("token");
      expect(body).not.toHaveProperty("user");
    });

    test("should fail with invalid password", async () => {
      const response = await app.handle(new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: "admin",
          password: "wrongpassword"
        })
      }));

      expect(response.status).toBe(401);
      const body = await response.json() as ErrorResponse;

      expect(body).toHaveProperty("success", false);
      expect(body).toHaveProperty("message", "Invalid credentials");
      expect(body).not.toHaveProperty("token");
      expect(body).not.toHaveProperty("user");
    });

    test("should fail with missing username", async () => {
      const response = await app.handle(new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          password: "admin123"
        })
      }));

      expect(response.status).toBe(422); // Elysia validation error
      const body = await response.json() as ValidationErrorResponse;

      // Elysia validation errors have different structure
      expect(body).toHaveProperty("type");
      expect(body).toHaveProperty("message");
    });

    test("should fail with missing password", async () => {
      const response = await app.handle(new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: "admin"
        })
      }));

      expect(response.status).toBe(422); // Elysia validation error
      const body = await response.json() as ValidationErrorResponse;

      // Elysia validation errors have different structure
      expect(body).toHaveProperty("type");
      expect(body).toHaveProperty("message");
    });

    test("should return valid JSON content type", async () => {
      const response = await app.handle(new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: "admin",
          password: "admin123"
        })
      }));

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("application/json");
    });
  });

  describe("GET /api/profile", () => {
    let authToken: string;

    beforeEach(async () => {
      // Login to get auth token
      const loginResponse = await app.handle(new Request("http://localhost/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: "admin",
          password: "admin123"
        })
      }));
      
      const loginBody = await loginResponse.json() as LoginResponse;
      authToken = loginBody.token!;
    });

    test("should get profile with valid token", async () => {
      const response = await app.handle(new Request("http://localhost/api/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      }));

      expect(response.status).toBe(200);
      const body = await response.json() as ProfileResponse;

      expect(body).toHaveProperty("success", true);
      expect(body).toHaveProperty("message", "Profile data retrieved successfully");
      expect(body).toHaveProperty("user");
      expect(body).toHaveProperty("timestamp");
      expect(body.user).toHaveProperty("userId");
      expect(body.user).toHaveProperty("username");
    });

    test("should fail without authorization header", async () => {
      const response = await app.handle(new Request("http://localhost/api/profile", {
        method: "GET"
      }));

      expect(response.status).toBe(401);
      const body = await response.json() as ErrorResponse;

      expect(body).toHaveProperty("success", false);
      expect(body).toHaveProperty("message");
    });

    test("should fail with invalid token", async () => {
      const response = await app.handle(new Request("http://localhost/api/profile", {
        method: "GET",
        headers: {
          "Authorization": "Bearer invalidtoken"
        }
      }));

      expect(response.status).toBe(401);
      const body = await response.json() as ErrorResponse;

      expect(body).toHaveProperty("success", false);
      expect(body).toHaveProperty("message");
    });

    test("should return valid JSON content type", async () => {
      const response = await app.handle(new Request("http://localhost/api/profile", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${authToken}`
        }
      }));

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("application/json");
    });
  });
});