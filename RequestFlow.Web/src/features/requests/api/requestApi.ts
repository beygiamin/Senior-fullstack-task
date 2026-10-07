import { httpClient } from '../../../lib/http/client';
import type { CreateRequestPayload, RequestItem } from '../types/request';

export const requestApi = {
  getAll: () =>
    httpClient.get<RequestItem[]>('/requests').then((response) => response.data),

  create: (payload: CreateRequestPayload) =>
    httpClient.post<RequestItem>('/requests', payload).then((response) => response.data),

  approve: (id: string) =>
    httpClient.put<RequestItem>(`/requests/${id}/review`, { decision: 1 }).then((response) => response.data),

  reject: (id: string) =>
    httpClient.put<RequestItem>(`/requests/${id}/review`, { decision: 2 }).then((response) => response.data),
};
