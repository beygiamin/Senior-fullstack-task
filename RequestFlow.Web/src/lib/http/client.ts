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

const serverMessageTranslations: Record<string, string> = {
  'title is required.': 'وارد کردن عنوان الزامی است.',
  'amount must be greater than zero.': 'مبلغ باید بیشتر از صفر باشد.',
  'username and password are required.': 'وارد کردن نام کاربری و رمز عبور الزامی است.',
  'role must be employee, manager, or finance.': 'نقش باید کارمند، مدیر یا امور مالی باشد.',
  'a user with this username already exists.': 'کاربری با این نام کاربری از قبل وجود دارد.',
  "decision must be 'approved' or 'rejected'.": 'تصمیم باید «تأیید» یا «رد» باشد.',
  'this request has already been processed.': 'این درخواست قبلاً بررسی شده است.',
  'one or more validation errors occurred.': 'اطلاعات واردشده معتبر نیست.',
};

const translateServerMessage = (message: string): string => {
  const normalizedMessage = message.trim().toLowerCase();
  const translation = serverMessageTranslations[normalizedMessage];
  if (translation) {
    return translation;
  }

  const minimumPasswordLength = message.match(/^Passwords must be at least (\d+) characters\.$/i);
  if (minimumPasswordLength) {
    return `رمز عبور باید حداقل ${minimumPasswordLength[1]} نویسه داشته باشد.`;
  }

  return message;
};

const getServerMessage = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const message = value.trim();
    return message ? translateServerMessage(message) : undefined;
  }

  if (Array.isArray(value)) {
    const messages = value
      .map(getServerMessage)
      .filter((message): message is string => Boolean(message));
    return [...new Set(messages)].join('؛ ') || undefined;
  }

  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const body = value as Record<string, unknown>;
  const validationMessage = getServerMessage(body.errors);
  if (validationMessage) {
    return validationMessage;
  }

  for (const key of ['detail', 'message', 'error', 'title']) {
    const message = getServerMessage(body[key]);
    if (message) {
      return message;
    }
  }

  const nestedMessages = Object.values(body)
    .map(getServerMessage)
    .filter((message): message is string => Boolean(message));
  return [...new Set(nestedMessages)].join('؛ ') || undefined;
};

const getHttpStatusMessage = (status: number): string => {
  if (status === 400) {
    return 'اطلاعات واردشده معتبر نیست. لطفاً آن‌ها را بررسی کنید.';
  }
  if (status === 401) {
    return 'نشست شما منقضی شده است. لطفاً دوباره وارد شوید.';
  }
  if (status === 403) {
    return 'شما مجاز به انجام این عملیات نیستید.';
  }
  if (status === 404) {
    return 'مورد درخواستی پیدا نشد.';
  }
  if (status === 409) {
    return 'این درخواست با وضعیت فعلی سازگار نیست. صفحه را تازه‌سازی و دوباره تلاش کنید.';
  }
  if (status >= 500) {
    return 'سرور نتوانست درخواست را انجام دهد. لطفاً بعداً دوباره تلاش کنید.';
  }

  return 'انجام درخواست ممکن نشد.';
};

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const serverMessage = getServerMessage(error.response?.data);
    if (serverMessage) {
      return serverMessage;
    }

    if (!error.response) {
      return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
        ? 'زمان انتظار برای پاسخ سرور به پایان رسید. لطفاً دوباره تلاش کنید.'
        : 'ارتباط با سرور برقرار نشد. اتصال اینترنت خود را بررسی و دوباره تلاش کنید.';
    }

    return getHttpStatusMessage(error.response.status);
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'مشکلی پیش آمد. لطفاً دوباره تلاش کنید.';
};
