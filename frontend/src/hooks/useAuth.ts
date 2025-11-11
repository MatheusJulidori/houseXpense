import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { authService } from '../services/auth.service';
import { useEffect } from 'react';
import type { LoginRequest, RegisterRequest, User } from '../types/auth.types';

// Query keys
export const authKeys = {
    all: ['auth'] as const,
    user: () => [...authKeys.all, 'user'] as const,
};

// Custom hook for authentication
export const useAuth = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Get current user from localStorage
    const user = authService.getUser();
    const token = authService.getToken();
    const isAuthenticated = authService.isAuthenticated();

    // Hydrate user from API if we have a token but no stored user
    useEffect(() => {
        const hydrate = async () => {
            if (token && !user) {
                try {
                    const me = await authService.getCurrentUser();
                    authService.setUser(me);
                    await queryClient.invalidateQueries({ queryKey: authKeys.user() });
                } catch {
                    // If token invalid, logout
                    authService.logout();
                }
            }
        };
        void hydrate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    // Login mutation
    const loginMutation = useMutation({
        mutationFn: async (credentials: LoginRequest) => {
            const response = await authService.login(credentials);
            authService.setToken(response.access_token);
            // Fetch current user with fresh token
            const me = await authService.getCurrentUser();
            authService.setUser(me);
            return response;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: authKeys.user() });
        },
    });

    // Register mutation
    const registerMutation = useMutation({
        mutationFn: async (userData: RegisterRequest) => {
            const response = await authService.register(userData);
            authService.setToken(response.access_token);

            // Create user object
            const user: User = {
                id: 'temp-id', // You'll need to get this from the token or API
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: `${userData.firstName}${userData.lastName}`.toLowerCase(),
                createdAt: new Date().toISOString(),
            };
            authService.setUser(user);

            return response;
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: authKeys.user() });
        },
    });

    // Logout function
    const logout = () => {
        authService.logout();
        queryClient.clear();
        // Redirect to login page after logout
        void navigate({ to: '/login' });
    };

    return {
        user,
        token,
        isAuthenticated,
        isLoading: loginMutation.isPending || registerMutation.isPending,
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        logout,
        loginError: loginMutation.error,
        registerError: registerMutation.error,
    };
};
