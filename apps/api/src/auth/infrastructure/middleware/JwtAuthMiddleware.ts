import { AuthenticationService } from '../../domain/services/AuthenticationService';

export interface JwtPayload {
  userId: number;
  username: string;
  iat: number;
  exp: number;
  iss: string;
}

export interface AuthenticatedContext {
  user: {
    userId: number;
    username: string;
  };
}

export class JwtAuthMiddleware {
  constructor(private authService: AuthenticationService) {}

  async authenticate(authorizationHeader?: string): Promise<AuthenticatedContext | null> {
    if (!authorizationHeader) {
      return null;
    }

    // Extract token from "Bearer <token>" format
    const tokenMatch = authorizationHeader.match(/^Bearer\s+(.+)$/);
    if (!tokenMatch) {
      return null;
    }

    const token = tokenMatch[1];
    
    // Validate JWT token
    const payload = this.authService.validateJwtToken(token);
    if (!payload) {
      return null;
    }

    // Type assertion for JWT payload
    const jwtPayload = payload as JwtPayload;

    return {
      user: {
        userId: jwtPayload.userId,
        username: jwtPayload.username
      }
    };
  }

  createElysiaPlugin() {
    const self = this;
    return (app: any) => {
      return app.derive(async ({ headers }: { headers: Record<string, string | undefined> }) => {
        const authContext = await self.authenticate(headers.authorization);
        return {
          auth: authContext
        };
      });
    };
  }

  createProtectedHandler() {
    return {
      beforeHandle: async ({ auth, set }: { auth: AuthenticatedContext | null; set: any }) => {
        if (!auth) {
          set.status = 401;
          return {
            success: false,
            message: 'Unauthorized - Valid JWT token required'
          };
        }
      }
    };
  }
}