export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';
export type RequestRole = 'Employee' | 'Manager' | 'Finance';

export interface RequestItem {
  id: string;
  title: string;
  amount: number;
  description: string;
  status: RequestStatus;
  createdByUserId: string;
  assignedRole: RequestRole;
  createdAt: string;
}

export interface CreateRequestPayload {
  title: string;
  amount: number;
  description: string;
}

export interface ReviewRequestPayload {
  id: string;
  decision: 'Approved' | 'Rejected';
}
