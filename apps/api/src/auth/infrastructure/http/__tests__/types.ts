// Test interfaces to replace 'as any' usage

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export interface ErrorResponse {
  success: boolean;
  message: string;
  type?: string;
}

export interface ProfileResponse {
  success: boolean;
  message: string;
  user?: {
    userId: number;
    username: string;
  };
  timestamp: string;
}

export interface ValidationErrorResponse {
  type: string;
  message: string;
  expected?: any;
  found?: any;
  errors?: Array<{
    type: string;
    schema: any;
    path: string;
    value: any;
    message: string;
  }>;
}