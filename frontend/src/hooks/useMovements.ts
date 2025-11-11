import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { movementsService } from '../services/movements.service';
import type {
    CreateMovementRequest,
    UpdateMovementRequest,
    MovementQueryParams,
    MovementFilters,
} from '../types/movement.types';
import {
    buildMovementQueryParams,
    calculateMovementStats,
    currentMonthFilters,
    lastMonthsFilters,
    yearFilters,
} from '../lib/movement-filters';

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
            void queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
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
            void queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
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
            void queryClient.invalidateQueries({ queryKey: movementKeys.lists() });
        },
    });
};

// Hook for movement statistics
export const useMovementStats = (filters?: MovementQueryParams) => {
    const { data: movements, isLoading, error } = useMovements(filters);

    const stats = calculateMovementStats(movements);

    return {
        stats,
        isLoading,
        error,
    };
};

// Helper functions for filtering
export const movementFilters = {
    toQueryParams: buildMovementQueryParams,
    getCurrentMonth: currentMonthFilters,
    getLastMonths: lastMonthsFilters,
    getYear: yearFilters,
};

// Hook for filtered movements by time period
export const useMovementsByTimePeriod = (filters: MovementFilters) => {
    const queryParams = buildMovementQueryParams(filters);
    return useMovements(queryParams);
};
