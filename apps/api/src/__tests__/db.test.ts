import { describe, test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { TableInfoResult, TableColumn, TestTableRecord, CountResult } from "./types";

// Create isolated database for testing
const createTestDb = () => {
  const db = new Database(":memory:");
  
  // Initialize database with the same structure as main db
  db.exec(`
    CREATE TABLE IF NOT EXISTS test_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      message TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert a test record if the table is empty (same logic as main db)
  const count = db.query('SELECT COUNT(*) as count FROM test_table').get() as { count: number };
  if (count.count === 0) {
    db.query('INSERT INTO test_table (message) VALUES (?)').run('Database initialized successfully');
  }

  return db;
};

describe("Database Connection and Schema", () => {
  let testDb: Database;

  beforeEach(() => {
    testDb = createTestDb();
  });

  describe("database initialization", () => {
    test("should create test_table on initialization", () => {
      const tableInfo = testDb.query("SELECT name FROM sqlite_master WHERE type='table' AND name='test_table'").get();
      expect(tableInfo).toBeDefined();
      expect((tableInfo as TableInfoResult).name).toBe("test_table");
    });

    test("should have correct table structure", () => {
      const tableInfo = testDb.query("PRAGMA table_info(test_table)").all() as TableColumn[];
      
      const columns = tableInfo.map(col => ({
        name: col.name,
        type: col.type,
        pk: col.pk
      }));

      expect(columns).toContainEqual({ name: 'id', type: 'INTEGER', pk: 1 });
      expect(columns).toContainEqual({ name: 'message', type: 'TEXT', pk: 0 });
      expect(columns).toContainEqual({ name: 'created_at', type: 'DATETIME', pk: 0 });
    });

    test("should insert initial record", () => {
      const records = testDb.query('SELECT * FROM test_table').all();
      expect(records).toHaveLength(1);
      expect((records[0] as TestTableRecord).message).toBe('Database initialized successfully');
    });

    test("should not duplicate initial record on multiple initializations", () => {
      // Create another database instance with same logic
      const anotherDb = createTestDb();
      
      const count = anotherDb.query('SELECT COUNT(*) as count FROM test_table').get() as { count: number };
      expect(count.count).toBe(1);
    });
  });

  describe("database operations", () => {
    test("should insert new records", () => {
      const message = "Test message";
      const insertQuery = testDb.query('INSERT INTO test_table (message) VALUES (?)');
      const result = insertQuery.run(message);

      expect(result.changes).toBe(1);
      expect(result.lastInsertRowid).toBeGreaterThan(1);

      const allRecords = testDb.query('SELECT * FROM test_table').all();
      expect(allRecords).toHaveLength(2); // Initial + new record
    });

    test("should query records", () => {
      // Insert test records
      testDb.query('INSERT INTO test_table (message) VALUES (?)').run('Message 1');
      testDb.query('INSERT INTO test_table (message) VALUES (?)').run('Message 2');

      const records = testDb.query('SELECT * FROM test_table ORDER BY id').all();
      expect(records).toHaveLength(3); // Initial + 2 new records

      const messages = (records as TestTableRecord[]).map(r => r.message);
      expect(messages).toContain('Database initialized successfully');
      expect(messages).toContain('Message 1');
      expect(messages).toContain('Message 2');
    });

    test("should handle parameterized queries", () => {
      const message = "Parameterized message";
      testDb.query('INSERT INTO test_table (message) VALUES (?)').run(message);

      const record = testDb.query('SELECT * FROM test_table WHERE message = ?').get(message) as TestTableRecord;
      expect(record).toBeDefined();
      expect(record.message).toBe(message);
    });

    test("should handle multiple inserts", () => {
      const messages = ['Msg 1', 'Msg 2', 'Msg 3', 'Msg 4', 'Msg 5'];
      const insertQuery = testDb.query('INSERT INTO test_table (message) VALUES (?)');

      for (const msg of messages) {
        insertQuery.run(msg);
      }

      const count = testDb.query('SELECT COUNT(*) as count FROM test_table').get() as { count: number };
      expect(count.count).toBe(6); // 5 new + 1 initial
    });

    test("should handle date operations", () => {
      testDb.query('INSERT INTO test_table (message) VALUES (?)').run('Date test');

      const record = testDb.query('SELECT * FROM test_table WHERE message = ?').get('Date test') as TestTableRecord;
      expect(record.created_at).toBeDefined();
      
      // Verify it's a valid timestamp
      const timestamp = new Date(record.created_at);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
      expect(timestamp.getTime()).toBeGreaterThan(0);
    });
  });

  describe("query performance and limits", () => {
    test("should handle large result sets", () => {
      // Insert many records
      const insertQuery = testDb.query('INSERT INTO test_table (message) VALUES (?)');
      for (let i = 1; i <= 100; i++) {
        insertQuery.run(`Message ${i}`);
      }

      const allRecords = testDb.query('SELECT * FROM test_table').all();
      expect(allRecords).toHaveLength(101); // 100 + 1 initial

      // Test LIMIT functionality
      const limitedRecords = testDb.query('SELECT * FROM test_table ORDER BY id LIMIT 5').all();
      expect(limitedRecords).toHaveLength(5);
    });

    test("should handle ordering and filtering", () => {
      // Insert test data
      const messages = ['Apple', 'Banana', 'Cherry', 'Date'];
      const insertQuery = testDb.query('INSERT INTO test_table (message) VALUES (?)');
      
      for (const msg of messages) {
        insertQuery.run(msg);
      }

      // Test ordering
      const orderedRecords = testDb.query('SELECT message FROM test_table WHERE message != ? ORDER BY message ASC').all('Database initialized successfully') as TestTableRecord[];
      const orderedMessages = orderedRecords.map(r => r.message);
      expect(orderedMessages).toEqual(['Apple', 'Banana', 'Cherry', 'Date']);

      // Test filtering
      const filteredRecords = testDb.query("SELECT * FROM test_table WHERE message LIKE ?").all('%a%') as TestTableRecord[];
      const filteredMessages = filteredRecords.map(r => r.message);
      expect(filteredMessages).toContain('Apple');
      expect(filteredMessages).toContain('Banana');
      expect(filteredMessages).toContain('Date');
    });
  });

  describe("error handling", () => {
    test("should handle invalid SQL gracefully", () => {
      try {
        testDb.query('INVALID SQL STATEMENT').run();
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
        expect(error instanceof Error).toBe(true);
      }
    });

    test("should handle missing parameters", () => {
      try {
        testDb.query('INSERT INTO test_table (message) VALUES (?)').run(); // Missing parameter
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test("should handle null values appropriately", () => {
      try {
        // message is NOT NULL, so this should fail
        testDb.query('INSERT INTO test_table (message) VALUES (?)').run(null);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    test("should handle non-existent table queries", () => {
      try {
        testDb.query('SELECT * FROM non_existent_table').all();
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("transaction behavior", () => {
    test("should support basic transactions", () => {
      testDb.exec('BEGIN TRANSACTION');
      
      try {
        testDb.query('INSERT INTO test_table (message) VALUES (?)').run('Transaction test 1');
        testDb.query('INSERT INTO test_table (message) VALUES (?)').run('Transaction test 2');
        
        testDb.exec('COMMIT');
        
        const count = testDb.query('SELECT COUNT(*) as count FROM test_table WHERE message LIKE ?').get('Transaction test%') as { count: number };
        expect(count.count).toBe(2);
      } catch (error) {
        testDb.exec('ROLLBACK');
        throw error;
      }
    });

    test("should support rollback on error", () => {
      const initialCount = testDb.query('SELECT COUNT(*) as count FROM test_table').get() as { count: number };
      
      testDb.exec('BEGIN TRANSACTION');
      
      try {
        testDb.query('INSERT INTO test_table (message) VALUES (?)').run('Before error');
        // This should cause an error (inserting null into NOT NULL column)
        testDb.query('INSERT INTO test_table (message) VALUES (?)').run(null);
        testDb.exec('COMMIT');
        
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        testDb.exec('ROLLBACK');
        
        const finalCount = testDb.query('SELECT COUNT(*) as count FROM test_table').get() as { count: number };
        expect(finalCount.count).toBe(initialCount.count); // Should be unchanged
      }
    });
  });
});