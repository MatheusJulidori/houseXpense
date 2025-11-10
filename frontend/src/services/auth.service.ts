import { api } from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../types/auth.types';

export const authService = {
    // Login user
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        return api.post<AuthResponse>('/auth/login', credentials);
    },

    // Register user
    register: async (userData: RegisterRequest): Promise<AuthResponse> => {
        return api.post<AuthResponse>('/auth/register', userData);
    },

    // Get current user (if you add this endpoint to backend)
    getCurrentUser: async (): Promise<User> => {
        return api.get<User>('/auth/me');
    },

    // Token management
    setToken: (token: string): void => {
        localStorage.setItem('auth_token', token);
    },

    getToken: (): string | null => {
        return localStorage.getItem('auth_token');
    },

    removeToken: (): void => {
        localStorage.removeItem('auth_token');
    },

    // User data management
    setUser: (user: User): void => {
        localStorage.setItem('user', JSON.stringify(user));
    },

    getUser: (): User | null => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    removeUser: (): void => {
        localStorage.removeItem('user');
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        const token = authService.getToken();
        // Consider a user authenticated if a token exists; user profile will be hydrated separately
        return !!token;
    },

    // Logout
    logout: (): void => {
        authService.removeToken();
        authService.removeUser();
    },
};
