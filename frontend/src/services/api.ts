/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
    type AxiosInstance,
    type AxiosRequestConfig,
    type AxiosResponse,
} from 'axios';
import type { ApiConfig, ApiError } from '../types/api.types';
import type { AuthSessionResponse } from '../types/auth.types';
import { appConfig } from '../config';
import { STORAGE_KEYS } from '../utils/constants';
import { getCsrfToken } from '../utils/cookies';

const API_CONFIG: ApiConfig = {
    baseURL: appConfig.apiUrl,
    timeout: 10000,
};

const apiClient: AxiosInstance = axios.create(API_CONFIG);
apiClient.defaults.withCredentials = true;

interface RetryableAxiosRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
}

const AUTH_ROUTE_EXCLUSIONS = ['/auth/login', '/auth/register', '/auth/logout', '/auth/refresh'];
const isBrowser = typeof window !== 'undefined';

const persistUser = (user: AuthSessionResponse['user']) => {
    if (!isBrowser) {
        return;
    }
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

const clearUser = () => {
    if (!isBrowser) {
        return;
    }
    localStorage.removeItem(STORAGE_KEYS.USER);
};

let refreshPromise: Promise<AuthSessionResponse> | null = null;

const triggerRefresh = async (): Promise<AuthSessionResponse> => {
    if (!isBrowser) {
        throw new Error('Cannot refresh session outside the browser environment.');
    }

    if (!refreshPromise) {
        const csrf = getCsrfToken();
        refreshPromise = axios
            .post<AuthSessionResponse>(
                `${API_CONFIG.baseURL}/auth/refresh`,
                undefined,
                {
                    withCredentials: true,
                    headers: csrf
                        ? {
                              'X-CSRF-Token': csrf,
                          }
                        : undefined,
                }
            )
            .then((response) => response.data)
            .then((session) => {
                persistUser(session.user);
                return session;
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    return refreshPromise;
};

apiClient.interceptors.request.use(
    (config) => {
        config.withCredentials = true;
        const headers = config.headers ?? {};
        const csrf = getCsrfToken();
        if (csrf) {
            headers['X-CSRF-Token'] = csrf;
        }
        config.headers = headers;
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
        const status = error.response?.status;
        const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;

        const shouldAttemptRefresh =
            status === 401 &&
            originalRequest != null &&
            !originalRequest._retry &&
            !AUTH_ROUTE_EXCLUSIONS.some((route) => originalRequest.url?.includes(route));

        if (shouldAttemptRefresh) {
            originalRequest._retry = true;
            try {
                await triggerRefresh();
                return apiClient(originalRequest);
            } catch (refreshError) {
                clearUser();
                if (isBrowser) {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        if (status === 401) {
            clearUser();
            if (isBrowser) {
                window.location.href = '/login';
            }
        }

        const apiError: ApiError = {
            message: error.response?.data?.message || error.message || 'An error occurred',
            statusCode: status || 500,
            error: error.response?.data?.error,
        };

        return Promise.reject(apiError);
    }
);

export const api = {
    get: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        apiClient.get(url, config).then((response) => response.data),

    post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
        apiClient.post(url, data, config).then((response) => response.data),

    put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
        apiClient.put(url, data, config).then((response) => response.data),

    patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
        apiClient.patch(url, data, config).then((response) => response.data),

    delete: <T>(url: string, config?: AxiosRequestConfig): Promise<T> =>
        apiClient.delete(url, config).then((response) => response.data),
};

export default apiClient;
