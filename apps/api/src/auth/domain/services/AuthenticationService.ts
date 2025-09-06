interface JwtPayload {
  userId: number;
  username: string;
  iat: number;
  exp?: number;
  iss?: string;
}

export interface AuthenticationService {
  validatePassword(plainPassword: string, hashedPassword: string): boolean;
  hashPassword(password: string): string;
  generateJwtToken(payload: Omit<JwtPayload, 'iat'>): string;
  validateJwtToken(token: string): JwtPayload | null;
}