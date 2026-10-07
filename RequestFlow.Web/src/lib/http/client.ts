import axios from 'axios';
import { env } from '../../config/env';
import { tokenStorage } from '../storage/tokenStorage';

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const token = tokenStorage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      tokenStorage.clearAuth();
      window.location.assign('/login');
    }

    return Promise.reject(error);
  },
);

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data;

    if (typeof serverMessage === 'string') {
      return serverMessage;
    }

    if (serverMessage && typeof serverMessage === 'object') {
      const candidate = (serverMessage as { message?: string; title?: string }).message;
      if (candidate) {
        return candidate;
      }
    }

    return error.message || 'Something went wrong.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong.';
};
