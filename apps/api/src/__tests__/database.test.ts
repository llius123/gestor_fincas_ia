import { describe, test, expect, beforeEach } from "bun:test";
import { Elysia, t } from "elysia";
import { cors } from "@elysiajs/cors";
import { Database } from "bun:sqlite";

// Create test database for testing
const createTestDb = () => {
  const db = new Database(":memory:");
  
  // Initialize test table
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  return db;
};

// Create test app with database endpoint
const createTestApp = (db: Database) => {
  return new Elysia()
    .use(cors())
    .get("/api/test-db", () => {
      try {
        // Test database connection by fetching test records
        const records = db.query('SELECT * FROM test_table ORDER BY created_at DESC LIMIT 5').all();

        // Insert a new test record
        const insertQuery = db.query('INSERT INTO test_table (message) VALUES (?)');
        insertQuery.run(`Test connection at ${new Date().toISOString()}`);

        return {
          status: "success",
          message: "Database connection working correctly",
          existingRecords: records,
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        return {
          status: "error",
          message: "Database connection failed",
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString()
        };
      }
    });
};

describe("Database Endpoints", () => {
  let testDb: Database;
  let app: Elysia;

  beforeEach(() => {
    testDb = createTestDb();
    app = createTestApp(testDb);
  });

  describe("GET /api/test-db", () => {
    test("should successfully connect to database", async () => {
      const response = await app.handle(new Request("http://localhost/api/test-db"));

      expect(response.status).toBe(200);
      const body = await response.json();

      expect(body).toHaveProperty("status", "success");
      expect(body).toHaveProperty("message", "Database connection working correctly");
      expect(body).toHaveProperty("existingRecords");
      expect(body).toHaveProperty("timestamp");
      expect(Array.isArray(body.existingRecords)).toBe(true);
    });

    test("should insert new record on each call", async () => {
      // First call
      const response1 = await app.handle(new Request("http://localhost/api/test-db"));
      const body1 = await response1.json();
      const recordsCount1 = body1.existingRecords.length;

      // Second call
      const response2 = await app.handle(new Request("http://localhost/api/test-db"));
      const body2 = await response2.json();
      const recordsCount2 = body2.existingRecords.length;

      // Should have one more record after second call
      expect(recordsCount2).toBe(recordsCount1 + 1);
    });

    test("should return valid JSON content type", async () => {
      const response = await app.handle(new Request("http://localhost/api/test-db"));

      expect(response.status).toBe(200);
      expect(response.headers.get("content-type")).toContain("application/json");
    });

    test("should include timestamp in response", async () => {
      const response = await app.handle(new Request("http://localhost/api/test-db"));
      const body = await response.json();

      expect(body).toHaveProperty("timestamp");
      
      // Validate timestamp format (ISO string)
      const timestamp = new Date(body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });
});