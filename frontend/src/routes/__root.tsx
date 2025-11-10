import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Suspense } from 'react';
import { Toaster } from 'sonner';

export const Route = createRootRoute({
    component: () => (
        <div className="min-h-screen bg-background">
            <Suspense fallback={<div className="p-6 text-muted-foreground">Carregando...</div>}>
                <Outlet />
            </Suspense>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'hsl(var(--card))',
                        color: 'hsl(var(--card-foreground))',
                        border: '1px solid hsl(var(--border))',
                    },
                }}
            />
        </div>
    ),
});
