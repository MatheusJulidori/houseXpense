import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { authService } from '../services/auth.service';
const LoginPage = lazy(() => import('../pages/LoginPage'));

export const Route = createFileRoute('/login')({
    component: Login,
    beforeLoad: () => {
        const isAuthenticated = authService.isAuthenticated();
        if (isAuthenticated) {
            throw redirect({ to: '/dashboard' });
        }
    },
});

function Login() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}>
            <LoginPage />
        </Suspense>
    );
}
