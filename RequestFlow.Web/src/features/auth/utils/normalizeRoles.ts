import type { UserRole } from '../../../types';

export function normalizeRoles(roles: string[] | undefined): UserRole[] {
  const uniqueRoles = new Set<UserRole>();

  for (const role of roles ?? []) {
    if (role === 'Employee' || role === 'Manager' || role === 'Finance') {
      uniqueRoles.add(role);
    }
  }

  return Array.from(uniqueRoles);
}
