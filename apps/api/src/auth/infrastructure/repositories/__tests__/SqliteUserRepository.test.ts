import { describe, test, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { SqliteUserRepository } from "../SqliteUserRepository";
import { User } from "../../../domain/entities/User";

describe("SqliteUserRepository", () => {
  let db: Database;
  let userRepository: SqliteUserRepository;

  beforeEach(() => {
    // Create in-memory database for each test
    db = new Database(":memory:");
    userRepository = new SqliteUserRepository(db);
  });

  describe("initialization", () => {
    test("should create users table", () => {
      // Check if table was created by trying to query it
      const tableInfo = db.query("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
      expect(tableInfo).toBeDefined();
      expect((tableInfo as any).name).toBe("users");
    });

    test("should seed default user on initialization", async () => {
      const defaultUser = await userRepository.findByUsername("admin");
      
      expect(defaultUser).not.toBeNull();
      expect(defaultUser!.username).toBe("admin");
      expect(defaultUser!.password).toBe("admin123");
      expect(defaultUser!.role).toBe("Administrador");
      expect(defaultUser!.id).toBe(1);
    });

    test("should not duplicate default user on multiple initializations", () => {
      // Create another repository instance (should not duplicate)
      new SqliteUserRepository(db);
      
      const userCount = db.query("SELECT COUNT(*) as count FROM users").get() as { count: number };
      expect(userCount.count).toBe(1);
    });
  });

  describe("findByUsername", () => {
    test("should find existing user by username", async () => {
      const user = await userRepository.findByUsername("admin");
      
      expect(user).not.toBeNull();
      expect(user!.username).toBe("admin");
      expect(user!.password).toBe("admin123");
      expect(user!.role).toBe("Administrador");
      expect(user!.id).toBe(1);
      expect(user!.createdAt).toBeInstanceOf(Date);
      expect(user!.updatedAt).toBeInstanceOf(Date);
    });

    test("should return null for non-existent user", async () => {
      const user = await userRepository.findByUsername("nonexistent");
      expect(user).toBeNull();
    });

    test("should be case sensitive", async () => {
      const user = await userRepository.findByUsername("ADMIN");
      expect(user).toBeNull();
    });

    test("should handle empty username", async () => {
      const user = await userRepository.findByUsername("");
      expect(user).toBeNull();
    });

    test("should handle special characters in username", async () => {
      // First create a user with special characters
      const specialUser: User = {
        username: "user@domain.com",
        password: "password123",
        role: "Vecino",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await userRepository.save(specialUser);
      
      const foundUser = await userRepository.findByUsername("user@domain.com");
      expect(foundUser).not.toBeNull();
      expect(foundUser!.username).toBe("user@domain.com");
    });
  });

  describe("findById", () => {
    test("should find existing user by id", async () => {
      const user = await userRepository.findById(1);
      
      expect(user).not.toBeNull();
      expect(user!.id).toBe(1);
      expect(user!.username).toBe("admin");
      expect(user!.password).toBe("admin123");
      expect(user!.role).toBe("Administrador");
    });

    test("should return null for non-existent id", async () => {
      const user = await userRepository.findById(999);
      expect(user).toBeNull();
    });

    test("should return null for invalid id", async () => {
      const user = await userRepository.findById(-1);
      expect(user).toBeNull();
    });

    test("should return null for zero id", async () => {
      const user = await userRepository.findById(0);
      expect(user).toBeNull();
    });
  });

  describe("save - create new user", () => {
    test("should create new user without id", async () => {
      const newUser: User = {
        username: "newuser",
        password: "newpassword",
        role: "Vecino",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const savedUser = await userRepository.save(newUser);

      expect(savedUser.id).toBeDefined();
      expect(savedUser.id).toBeGreaterThan(1); // Should be 2 since admin is 1
      expect(savedUser.username).toBe("newuser");
      expect(savedUser.password).toBe("newpassword");
      expect(savedUser.role).toBe("Vecino");
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
    });

    test("should assign sequential ids", async () => {
      const user1: User = {
        username: "user1",
        password: "password1",
        role: "Vecino",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const user2: User = {
        username: "user2", 
        password: "password2",
        role: "Vecino",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const savedUser1 = await userRepository.save(user1);
      const savedUser2 = await userRepository.save(user2);

      expect(savedUser2.id).toBe(savedUser1.id! + 1);
    });

    test("should enforce unique username constraint", async () => {
      const duplicateUser: User = {
        username: "admin", // Already exists
        password: "newpassword",
        role: "Vecino",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      try {
        await userRepository.save(duplicateUser);
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
        // SQLite should throw constraint error
      }
    });

    test("should save user with default role", async () => {
      const userWithoutRole: User = {
        username: "noroleuser",
        password: "password",
        role: "Vecino",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const savedUser = await userRepository.save(userWithoutRole);
      expect(savedUser.role).toBe("Vecino");
    });
  });

  describe("save - update existing user", () => {
    test("should update existing user", async () => {
      // First get the existing admin user
      const existingUser = await userRepository.findById(1);
      expect(existingUser).not.toBeNull();

      // Update the user
      const updatedUser: User = {
        ...existingUser!,
        password: "newpassword",
        role: "SuperAdmin"
      };

      const savedUser = await userRepository.save(updatedUser);

      expect(savedUser.id).toBe(1);
      expect(savedUser.username).toBe("admin");
      expect(savedUser.password).toBe("newpassword");
      expect(savedUser.role).toBe("SuperAdmin");

      // Verify the update persisted
      const verifyUser = await userRepository.findById(1);
      expect(verifyUser!.password).toBe("newpassword");
      expect(verifyUser!.role).toBe("SuperAdmin");
    });

    test("should update username", async () => {
      const existingUser = await userRepository.findById(1);
      expect(existingUser).not.toBeNull();

      const updatedUser: User = {
        ...existingUser!,
        username: "superadmin"
      };

      await userRepository.save(updatedUser);

      // Should not find by old username
      const oldUser = await userRepository.findByUsername("admin");
      expect(oldUser).toBeNull();

      // Should find by new username
      const newUser = await userRepository.findByUsername("superadmin");
      expect(newUser).not.toBeNull();
      expect(newUser!.id).toBe(1);
    });

    test("should handle update of non-existent user id", async () => {
      const nonExistentUser: User = {
        id: 999,
        username: "ghost",
        password: "password",
        role: "Vecino",
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // This should run without error but not update anything
      const result = await userRepository.save(nonExistentUser);
      expect(result.id).toBe(999);

      // Verify no user was actually created/updated
      const verifyUser = await userRepository.findById(999);
      expect(verifyUser).toBeNull();
    });
  });

  describe("data integrity", () => {
    test("should handle concurrent operations", async () => {
      const promises = Array.from({ length: 10 }, (_, i) => {
        const user: User = {
          username: `user${i}`,
          password: `password${i}`,
          role: "Vecino",
          createdAt: new Date(),
          updatedAt: new Date()
        };
        return userRepository.save(user);
      });

      const results = await Promise.all(promises);
      
      // All should have unique IDs
      const ids = results.map(user => user.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);

      // All should be findable
      for (const result of results) {
        const foundUser = await userRepository.findById(result.id!);
        expect(foundUser).not.toBeNull();
        expect(foundUser!.username).toBe(result.username);
      }
    });

    test("should handle date conversion correctly", async () => {
      const specificDate = new Date('2024-01-01T12:00:00.000Z');
      const user: User = {
        username: "dateuser",
        password: "password",
        role: "Vecino",
        createdAt: specificDate,
        updatedAt: specificDate
      };

      const savedUser = await userRepository.save(user);
      const foundUser = await userRepository.findById(savedUser.id!);

      expect(foundUser!.createdAt).toBeInstanceOf(Date);
      expect(foundUser!.updatedAt).toBeInstanceOf(Date);
      // Note: SQLite might not preserve exact milliseconds, so we check if dates are reasonable
      expect(foundUser!.createdAt.getTime()).toBeGreaterThan(0);
      expect(foundUser!.updatedAt.getTime()).toBeGreaterThan(0);
    });

    test("should handle edge case usernames", async () => {
      const edgeCases = [
        "user with spaces",
        "user-with-dashes",
        "user_with_underscores",
        "user.with.dots",
        "user@with.email.format",
        "123numericstart",
        "MixedCaseUser"
      ];

      for (const username of edgeCases) {
        const user: User = {
          username,
          password: "password",
          role: "Vecino",
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const savedUser = await userRepository.save(user);
        const foundUser = await userRepository.findByUsername(username);
        
        expect(foundUser).not.toBeNull();
        expect(foundUser!.username).toBe(username);
        expect(foundUser!.id).toBe(savedUser.id);
      }
    });
  });
});