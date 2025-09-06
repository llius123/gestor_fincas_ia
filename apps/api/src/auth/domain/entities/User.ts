export type UserRole = 'Vecino' | 'Administrador';

export interface User {
  id: number;
  username: string;
  password: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}