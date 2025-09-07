// JWT interfaces to replace 'as any' usage

export interface JwtPayload {
  userId?: number;
  username?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  [key: string]: any; // For additional fields that might be present
}