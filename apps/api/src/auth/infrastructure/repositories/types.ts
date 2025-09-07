// Database row interfaces for production code

export interface UserRow {
  id: number;
  username: string;
  password: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface CountResult {
  count: number;
}