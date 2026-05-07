import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined;
    if (!config) return Promise.reject(error);

    const url = config.url ?? '';
    const isRefresh = url.includes('/auth/refresh');
    const isLogin = url.includes('/auth/login');

    if (error.response?.status === 401 && !config._retry && !isRefresh && !isLogin) {
      config._retry = true;
      try {
        await api.post('/auth/refresh', {});
        return api.request(config);
      } catch {
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);
