import { api } from './api';
import type { AuthSessionResponse, LoginRequest, RegisterRequest, User } from '../types/auth.types';
import { STORAGE_KEYS } from '../utils/constants';
import { getCsrfToken, getRefreshToken } from '../utils/cookies';

const isBrowser = typeof window !== 'undefined';

const storage = {
    setUser(user: User | null): void {
        if (!isBrowser) {
            return;
        }
        if (!user) {
            localStorage.removeItem(STORAGE_KEYS.USER);
            return;
        }
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },
    getUser(): User | null {
        if (!isBrowser) {
            return null;
        }
        const raw = localStorage.getItem(STORAGE_KEYS.USER);
        return raw ? (JSON.parse(raw) as User) : null;
    },
    clear(): void {
        if (!isBrowser) {
            return;
        }
        localStorage.removeItem(STORAGE_KEYS.USER);
    },
};

export const authService = {
    login: async (credentials: LoginRequest): Promise<AuthSessionResponse> => {
        const session = await api.post<AuthSessionResponse>('/auth/login', credentials);
        storage.setUser(session.user);
        return session;
    },

    register: async (userData: RegisterRequest): Promise<AuthSessionResponse> => {
        const session = await api.post<AuthSessionResponse>('/auth/register', userData);
        storage.setUser(session.user);
        return session;
    },

    getCurrentUser: async (): Promise<User> => {
        const me = await api.get<User>('/auth/me');
        storage.setUser(me);
        return me;
    },

    setUser: storage.setUser,
    getUser: storage.getUser,
    removeUser: storage.clear,

    isAuthenticated: (): boolean => {
        const hasUser = !!storage.getUser();
        if (hasUser) {
            return true;
        }
        return !!getRefreshToken();
    },

    hasActiveSessionCookie: (): boolean => !!getRefreshToken(),

    logout: async (): Promise<void> => {
        try {
            const csrf = getCsrfToken();
            await api.post<void>(
                '/auth/logout',
                undefined,
                csrf
                    ? {
                          headers: {
                              'X-CSRF-Token': csrf,
                          },
                      }
                    : undefined
            );
        } catch (error) {
            // If the session is already invalidated, ignore logout errors
            console.warn('Failed to call logout endpoint', error);
        } finally {
            storage.clear();
        }
    },
};
