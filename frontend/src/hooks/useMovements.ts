import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { movementsService } from '../services/movements.service';
import type {
    CreateMovementRequest,
    UpdateMovementRequest,
    MovementQueryParams,
    MovementFilters,
} from '../types/movement.types';

// Query keys
export const movementKeys = {
    all: ['movements'] as const,
    lists: () => [...movementKeys.all, 'list'] as const,
    list: (filters: MovementQueryParams) => [...movementKeys.lists(), filters] as const,
    details: () => [...movementKeys.all, 'detail'] as const,
    detail: (id: string) => [...movementKeys.details(), id] as const,
};

// Hook to get movements with filters
export const useMovements = (filters?: MovementQueryParams) => {
    return useQuery({
        queryKey: movementKeys.list(filters || {}),
        queryFn: () => movementsService.getMovements(filters),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

// Hook to get a single movement
export const useMovement = (id: string) => {
    return useQuery({
        queryKey: movementKeys.detail(id),
        queryFn: () => movementsService.getMovement(id),
        enabled: !!id,
    });
};

// Hook to create movement
export const useCreateMovement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMovementRequest) => movementsService.createMovement(data),
        onSuccess: () => {
            // Invalidate and refetch movements
            queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
        },
    });
};

// Hook to update movement
export const useUpdateMovement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<UpdateMovementRequest> }) =>
            movementsService.updateMovement(id, data),
        onSuccess: (updatedMovement) => {
            // Update the specific movement in cache
            queryClient.setQueryData(movementKeys.detail(updatedMovement.id), updatedMovement);
            // Invalidate lists to refetch
            queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
        },
    });
};

// Hook to delete movement
export const useDeleteMovement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => movementsService.deleteMovement(id),
        onSuccess: (_, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: movementKeys.detail(deletedId) });
            // Invalidate lists to refetch
            queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
        },
    });
};

// Hook for movement statistics
export const useMovementStats = (filters?: MovementQueryParams) => {
    const { data: movements, isLoading, error } = useMovements(filters);

    const stats = movements ? {
        totalMovements: movements.length,
        totalIncome: movements
            .filter(m => m.type === 'INCOME')
            .reduce((sum, m) => sum + Number(m.amount), 0),
        totalExpenses: movements
            .filter(m => m.type === 'EXPENSE')
            .reduce((sum, m) => sum + Number(m.amount), 0),
        netAmount: movements
            .reduce((sum, m) => sum + (m.type === 'INCOME' ? Number(m.amount) : -Number(m.amount)), 0),
        averageIncome: movements
            .filter(m => m.type === 'INCOME')
            .reduce((sum, m) => sum + Number(m.amount), 0) / Math.max(movements.filter(m => m.type === 'INCOME').length, 1),
        averageExpense: movements
            .filter(m => m.type === 'EXPENSE')
            .reduce((sum, m) => sum + Number(m.amount), 0) / Math.max(movements.filter(m => m.type === 'EXPENSE').length, 1),
    } : null;

    return {
        stats,
        isLoading,
        error,
    };
};

// Helper functions for filtering
export const movementFilters = {
    // Convert filters to query params
    toQueryParams: (filters: MovementFilters): MovementQueryParams => {
        const params: MovementQueryParams = {};

        if (filters.tags && filters.tags.length > 0) {
            params.tags = filters.tags.join(',');
        }

        if (filters.type) {
            params.type = filters.type;
        }

        // Handle date filtering
        if (filters.month && filters.year) {
            // Single month filter
            const startDate = new Date(filters.year, filters.month - 1, 1);
            const endDate = new Date(filters.year, filters.month, 0);
            params.startDate = startDate.toISOString().split('T')[0];
            params.endDate = endDate.toISOString().split('T')[0];
        } else if (filters.startDate && filters.endDate) {
            // Date range filter
            params.startDate = filters.startDate;
            params.endDate = filters.endDate;
        }

        return params;
    },

    // Get current month filter
    getCurrentMonth: (): MovementFilters => {
        const now = new Date();
        return {
            month: now.getMonth() + 1,
            year: now.getFullYear(),
        };
    },

    // Get last N months filter
    getLastMonths: (months: number): MovementFilters => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - months, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0);

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
        };
    },

    // Get year filter
    getYear: (year: number): MovementFilters => {
        return {
            startDate: `${year}-01-01`,
            endDate: `${year}-12-31`,
        };
    },
};

// Hook for filtered movements by time period
export const useMovementsByTimePeriod = (filters: MovementFilters) => {
    const queryParams = movementFilters.toQueryParams(filters);
    return useMovements(queryParams);
};
