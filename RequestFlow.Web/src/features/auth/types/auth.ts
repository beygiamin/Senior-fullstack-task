import type { UserRole } from '../../../types';

export interface LoginPayload {
  userName: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  role: UserRole;
}

export interface AuthResponse {
  userId: string;
  userName: string;
  token: string;
  roles: UserRole[];
}
