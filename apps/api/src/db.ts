import { Database } from "bun:sqlite";
import { join } from 'path';

const dbPath = join(process.cwd(), 'data.db');
const db = new Database(dbPath);

// Initialize database with a simple test table
db.exec(`
  CREATE TABLE IF NOT EXISTS test_table (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert a test record if the table is empty
const count = db.query('SELECT COUNT(*) as count FROM test_table').get() as { count: number };
if (count.count === 0) {
  db.query('INSERT INTO test_table (message) VALUES (?)').run('Database initialized successfully');
}

export { db };