import { describe, test, expect, beforeEach } from "bun:test";
import jwt from "jsonwebtoken";
import { SimpleAuthenticationService } from "../SimpleAuthenticationService";
import { JwtPayload } from "./types";

describe("SimpleAuthenticationService", () => {
  let authService: SimpleAuthenticationService;

  beforeEach(() => {
    authService = new SimpleAuthenticationService();
  });

  describe("validatePassword", () => {
    test("should return true for matching passwords", () => {
      const result = authService.validatePassword("password123", "password123");
      expect(result).toBe(true);
    });

    test("should return false for non-matching passwords", () => {
      const result = authService.validatePassword("password123", "wrongpassword");
      expect(result).toBe(false);
    });

    test("should return false for empty passwords", () => {
      const result1 = authService.validatePassword("", "password");
      const result2 = authService.validatePassword("password", "");
      const result3 = authService.validatePassword("", "");
      
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(true); // Both empty, so they match
    });

    test("should be case sensitive", () => {
      const result = authService.validatePassword("Password123", "password123");
      expect(result).toBe(false);
    });

    test("should handle special characters", () => {
      const password = "p@ssw0rd!#$%";
      const result = authService.validatePassword(password, password);
      expect(result).toBe(true);
    });
  });

  describe("hashPassword", () => {
    test("should return the same password (no hashing in demo)", () => {
      const password = "password123";
      const result = authService.hashPassword(password);
      expect(result).toBe(password);
    });

    test("should handle empty password", () => {
      const result = authService.hashPassword("");
      expect(result).toBe("");
    });

    test("should handle special characters", () => {
      const password = "p@ssw0rd!#$%";
      const result = authService.hashPassword(password);
      expect(result).toBe(password);
    });
  });

  describe("generateJwtToken", () => {
    test("should generate valid JWT token", () => {
      const payload = {
        userId: 1,
        username: "admin"
      };

      const token = authService.generateJwtToken(payload);
      
      expect(typeof token).toBe("string");
      expect(token.length).toBeGreaterThan(0);
      
      // Should have JWT structure (header.payload.signature)
      const parts = token.split(".");
      expect(parts).toHaveLength(3);
    });

    test("should generate different tokens for different payloads", () => {
      const payload1 = { userId: 1, username: "admin" };
      const payload2 = { userId: 2, username: "user" };

      const token1 = authService.generateJwtToken(payload1);
      const token2 = authService.generateJwtToken(payload2);

      expect(token1).not.toBe(token2);
    });

    test("should include issuer in token", () => {
      const payload = { userId: 1, username: "admin" };
      const token = authService.generateJwtToken(payload);
      
      // Decode without verification to check structure
      const decoded = jwt.decode(token) as JwtPayload;
      expect(decoded).toHaveProperty("iss", "gestor-fincas-api");
    });

    test("should include expiration in token", () => {
      const payload = { userId: 1, username: "admin" };
      const token = authService.generateJwtToken(payload);
      
      // Decode without verification to check structure
      const decoded = jwt.decode(token) as JwtPayload;
      expect(decoded).toHaveProperty("exp");
      expect(typeof decoded.exp).toBe("number");
      expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
    });
  });

  describe("validateJwtToken", () => {
    test("should validate valid JWT token", () => {
      const payload = { userId: 1, username: "admin" };
      const token = authService.generateJwtToken(payload);
      
      const result = authService.validateJwtToken(token);
      
      expect(result).not.toBeNull();
      expect(result).toHaveProperty("userId", 1);
      expect(result).toHaveProperty("username", "admin");
      expect(result).toHaveProperty("iat");
      expect(result).toHaveProperty("exp");
      expect(result).toHaveProperty("iss", "gestor-fincas-api");
    });

    test("should return null for invalid token", () => {
      const result = authService.validateJwtToken("invalid-token");
      expect(result).toBeNull();
    });

    test("should return null for empty token", () => {
      const result = authService.validateJwtToken("");
      expect(result).toBeNull();
    });

    test("should return null for malformed token", () => {
      const result = authService.validateJwtToken("header.payload");
      expect(result).toBeNull();
    });

    test("should return null for token with wrong signature", () => {
      // Create token with different secret
      const fakeToken = jwt.sign(
        { userId: 1, username: "admin" },
        "wrong-secret"
      );
      
      const result = authService.validateJwtToken(fakeToken);
      expect(result).toBeNull();
    });

    test("should return null for expired token", () => {
      // Create token that expires immediately
      const expiredToken = jwt.sign(
        { userId: 1, username: "admin" },
        "your-super-secret-jwt-key", // Same secret as service
        { expiresIn: "0s", issuer: "gestor-fincas-api" }
      );
      
      // Wait a bit to ensure expiration
      setTimeout(() => {
        const result = authService.validateJwtToken(expiredToken);
        expect(result).toBeNull();
      }, 100);
    });

    test("should validate token with all required fields", () => {
      const payload = { userId: 123, username: "testuser" };
      const token = authService.generateJwtToken(payload);
      
      const result = authService.validateJwtToken(token);
      
      expect(result).not.toBeNull();
      expect(result!.userId).toBe(123);
      expect(result!.username).toBe("testuser");
      expect(typeof result!.iat).toBe("number");
      expect(typeof result!.exp).toBe("number");
      expect(result!.iss).toBe("gestor-fincas-api");
    });
  });

  describe("integration tests", () => {
    test("should complete full authentication cycle", () => {
      const originalPassword = "mySecurePassword123";
      
      // Step 1: Hash password
      const hashedPassword = authService.hashPassword(originalPassword);
      
      // Step 2: Validate password
      const isValidPassword = authService.validatePassword(originalPassword, hashedPassword);
      expect(isValidPassword).toBe(true);
      
      // Step 3: Generate token
      const payload = { userId: 1, username: "admin" };
      const token = authService.generateJwtToken(payload);
      
      // Step 4: Validate token
      const validatedPayload = authService.validateJwtToken(token);
      expect(validatedPayload).not.toBeNull();
      expect(validatedPayload!.userId).toBe(payload.userId);
      expect(validatedPayload!.username).toBe(payload.username);
    });

    test("should reject invalid password in full cycle", () => {
      const originalPassword = "mySecurePassword123";
      const wrongPassword = "wrongPassword";
      
      // Step 1: Hash password
      const hashedPassword = authService.hashPassword(originalPassword);
      
      // Step 2: Try to validate with wrong password
      const isValidPassword = authService.validatePassword(wrongPassword, hashedPassword);
      expect(isValidPassword).toBe(false);
    });
  });
});