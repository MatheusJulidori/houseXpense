import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { authService } from '../services/auth.service';
const RegisterPage = lazy(() => import('../pages/RegisterPage'));

export const Route = createFileRoute('/register')({
    component: Register,
    beforeLoad: () => {
        const isAuthenticated = authService.isAuthenticated();
        if (isAuthenticated) {
            throw redirect({ to: '/dashboard' });
        }
    },
});

function Register() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}>
            <RegisterPage />
        </Suspense>
    );
}
