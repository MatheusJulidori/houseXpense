import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';
import { authService } from '../services/auth.service';
const DashboardPage = lazy(() => import('../pages/DashboardPage'));

export const Route = createFileRoute('/dashboard')({
    component: Dashboard,
    beforeLoad: () => {
        const isAuthenticated = authService.isAuthenticated();
        if (!isAuthenticated) {
            throw redirect({ to: '/login' });
        }
    },
});

function Dashboard() {
    return (
        <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando painel...</div>}>
            <DashboardPage />
        </Suspense>
    );
}
