import { AuthenticationService } from '../../domain/services/AuthenticationService';

export class SimpleAuthenticationService implements AuthenticationService {
  validatePassword(plainPassword: string, hashedPassword: string): boolean {
    // Simple comparison for demo purposes
    // In production, use proper password hashing (bcrypt, argon2, etc.)
    return plainPassword === hashedPassword;
  }

  hashPassword(password: string): string {
    // Simple "hashing" for demo purposes
    // In production, use proper password hashing
    return password;
  }
}