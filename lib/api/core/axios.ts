// frontend/lib/api/core/axios.ts
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios';
import { clearAuth, refreshToken as fallbackRefresh } from './auth';
import { ApiResponse } from './types';

// Browser: empty baseURL so requests go through the Next.js /api/* proxy
// (cookies scoped to www.mirvory.net are then sent automatically).
// SSR: full Railway URL — no browser cookie policy applies.
const API_URL = typeof window !== 'undefined'
  ? ''
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

type QueueEntry = {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
};

class ApiClient {
  private static instance: ApiClient;
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: QueueEntry[] = [];

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_URL,
      timeout: 10000,
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private processQueue(error: any, token: unknown = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.failedQueue = [];
  }

  private setupInterceptors(): void {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Guard: never retry refresh/login/logout endpoints on 401 → infinite loop
        const isRefreshEndpoint =
          originalRequest?.url?.includes('/api/users/refresh-token') ||
          originalRequest?.url?.includes('/api/users/login') ||
          originalRequest?.url?.includes('/api/users/logout');

        if (error.response?.status === 401 && !originalRequest?._retry && !isRefreshEndpoint) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => this.axiosInstance(originalRequest))
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            await this.axiosInstance.post('/api/users/refresh-token');
            this.processQueue(null);
            return this.axiosInstance(originalRequest);
          } catch (refreshErr) {
            this.processQueue(refreshErr);

            try {
              await fallbackRefresh();
            } catch (_) {
              clearAuth();
              if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
              }
            }

            return Promise.reject(refreshErr);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  public async patch<T = any, R = ApiResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
    return this.axiosInstance.patch<T, R>(url, data, config);
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }
}

const apiClient = ApiClient.getInstance();

export { apiClient };
export * from './types';
