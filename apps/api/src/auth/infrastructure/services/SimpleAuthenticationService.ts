import jwt from 'jsonwebtoken';
import { AuthenticationService } from '../../domain/services/AuthenticationService';

export class SimpleAuthenticationService implements AuthenticationService {
  private readonly jwtSecret = 'your-super-secret-jwt-key'; // TODO: Move to environment variable
  private readonly jwtExpiresIn = '24h';

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

  generateJwtToken(payload: Record<string, any>): string {
    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
      issuer: 'gestor-fincas-api'
    });
  }

  validateJwtToken(token: string): Record<string, any> | null {
    try {
      return jwt.verify(token, this.jwtSecret) as Record<string, any>;
    } catch (error) {
      return null;
    }
  }
}