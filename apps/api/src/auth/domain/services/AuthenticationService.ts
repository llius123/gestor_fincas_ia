export interface AuthenticationService {
  validatePassword(plainPassword: string, hashedPassword: string): boolean;
  hashPassword(password: string): string;
}