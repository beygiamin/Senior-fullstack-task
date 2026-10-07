export type UserRole = 'Employee' | 'Manager' | 'Finance';

export interface AuthUser {
  id: string;
  username: string;
  roles: UserRole[];
}
