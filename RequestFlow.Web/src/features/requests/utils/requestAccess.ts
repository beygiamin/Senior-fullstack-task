import type { AuthUser } from '../../../types';
import type { RequestItem } from '../types/request';

export function canReviewRequest(request: RequestItem, user: AuthUser | null): boolean {
  if (!user) {
    return false;
  }

  return request.status === 'Pending' && user.roles.includes(request.assignedRole);
}
