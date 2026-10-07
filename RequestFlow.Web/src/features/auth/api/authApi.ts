import { httpClient } from '../../../lib/http/client';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth';

export const authApi = {
  login: (payload: LoginPayload) =>
    httpClient.post<AuthResponse>('/auth/login', payload).then((response) => response.data),

  register: (payload: RegisterPayload) =>
    httpClient.post<AuthResponse>('/auth/register', payload).then((response) => response.data),
};
