import { Database } from "bun:sqlite";
import { User } from '../../domain/entities/User';
import { UserRepository } from '../../domain/ports/UserRepository';

export class SqliteUserRepository implements UserRepository {
  constructor(private db: Database) {
    this.initializeTable();
    this.seedDefaultUser();
  }

  private initializeTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  private seedDefaultUser(): void {
    const existingUser = this.db.query('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (existingUser.count === 0) {
      // Simple password hash for demo (in production use proper hashing)
      const defaultPasswordHash = 'admin123'; // In production: use bcrypt or similar
      this.db.query('INSERT INTO users (username, password) VALUES (?, ?)').run('admin', defaultPasswordHash);
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    const row = this.db.query('SELECT * FROM users WHERE username = ?').get(username) as any;
    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      password: row.password,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  async findById(id: number): Promise<User | null> {
    const row = this.db.query('SELECT * FROM users WHERE id = ?').get(id) as any;
    if (!row) return null;

    return {
      id: row.id,
      username: row.username,
      password: row.password,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  async save(user: User): Promise<User> {
    if (user.id) {
      // Update existing user
      this.db.query(`
        UPDATE users 
        SET username = ?, password = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(user.username, user.password, user.id);
      return user;
    } else {
      // Create new user
      const result = this.db.query(`
        INSERT INTO users (username, password) 
        VALUES (?, ?)
      `).run(user.username, user.password);
      
      return {
        ...user,
        id: Number(result.lastInsertRowid),
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }
}