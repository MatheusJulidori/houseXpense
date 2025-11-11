import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { authService } from '../services/auth.service';
import type { LoginRequest, RegisterRequest, User } from '../types/auth.types';
import { STORAGE_KEYS } from '../utils/constants';

export const authKeys = {
    all: ['auth'] as const,
    user: () => [...authKeys.all, 'user'] as const,
};

const isBrowser = typeof window !== 'undefined';

export const useAuth = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(() => authService.getUser());

    useEffect(() => {
        if (isBrowser) {
            const handleStorage = (event: StorageEvent) => {
                if (event.key === STORAGE_KEYS.USER) {
                    setUser(authService.getUser());
                }
            };
            window.addEventListener('storage', handleStorage);
            return () => window.removeEventListener('storage', handleStorage);
        }
        return undefined;
    }, []);

    useEffect(() => {
        if (!user && authService.hasActiveSessionCookie()) {
            const hydrateUser = async () => {
                try {
                    const me = await authService.getCurrentUser();
                    setUser(me);
                    await queryClient.invalidateQueries({ queryKey: authKeys.user() });
                } catch {
                    await authService.logout();
                    setUser(null);
                }
            };
            void hydrateUser();
        }
    }, [user, queryClient]);

    const loginMutation = useMutation({
        mutationFn: (credentials: LoginRequest) => authService.login(credentials),
        onSuccess: async (session) => {
            setUser(session.user);
            await queryClient.invalidateQueries({ queryKey: authKeys.user() });
        },
    });

    const registerMutation = useMutation({
        mutationFn: (payload: RegisterRequest) => authService.register(payload),
        onSuccess: async (session) => {
            setUser(session.user);
            await queryClient.invalidateQueries({ queryKey: authKeys.user() });
        },
    });

    const logout = async (): Promise<void> => {
        await authService.logout();
        setUser(null);
        queryClient.clear();
        await navigate({ to: '/login' });
    };

    return {
        user,
        isAuthenticated: authService.isAuthenticated(),
        isLoading: loginMutation.isPending || registerMutation.isPending,
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        logout,
        loginError: loginMutation.error,
        registerError: registerMutation.error,
    };
};
