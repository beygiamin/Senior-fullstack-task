import { canReviewRequest } from './requestAccess';
import type { AuthUser } from '../../../types';
import type { RequestItem } from '../types/request';

describe('requestAccess', () => {
  const managerUser: AuthUser = {
    id: 'user-1',
    username: 'manager',
    roles: ['Manager'],
  };

  const pendingManagerRequest: RequestItem = {
    id: 'req-1',
    title: 'Travel',
    amount: 2500,
    description: 'Team trip',
    status: 'Pending',
    createdByUserId: 'user-2',
    assignedRole: 'Manager',
    createdAt: new Date().toISOString(),
  };

  it('allows review only when the role matches a pending request', () => {
    expect(canReviewRequest(pendingManagerRequest, managerUser)).toBe(true);
    expect(canReviewRequest({ ...pendingManagerRequest, assignedRole: 'Finance' }, managerUser)).toBe(false);
    expect(canReviewRequest({ ...pendingManagerRequest, status: 'Approved' }, managerUser)).toBe(false);
  });
});
