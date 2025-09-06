export interface AuthenticationService {
  validatePassword(plainPassword: string, hashedPassword: string): boolean;
  hashPassword(password: string): string;
  generateJwtToken(payload: Record<string, any>): string;
  validateJwtToken(token: string): Record<string, any> | null;
}