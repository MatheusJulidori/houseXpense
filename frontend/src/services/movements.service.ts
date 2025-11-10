import { api } from './api';
import type {
    Movement,
    CreateMovementRequest,
    UpdateMovementRequest,
    MovementQueryParams,
    MovementFilters,
} from '../types/movement.types';

export const movementsService = {
    // Get all movements with optional filters
    getMovements: async (filters?: MovementQueryParams): Promise<Movement[]> => {
        const params = new URLSearchParams();

        if (filters?.tags) {
            params.append('tags', filters.tags);
        }
        if (filters?.startDate) {
            params.append('startDate', filters.startDate);
        }
        if (filters?.endDate) {
            params.append('endDate', filters.endDate);
        }
        if (filters?.month) {
            params.append('month', filters.month.toString());
        }
        if (filters?.year) {
            params.append('year', filters.year.toString());
        }
        if (filters?.type) {
            params.append('type', filters.type);
        }

        const queryString = params.toString();
        const url = queryString ? `/movements?${queryString}` : '/movements';

        return api.get<Movement[]>(url);
    },

    // Get movement by ID
    getMovement: async (id: string): Promise<Movement> => {
        return api.get<Movement>(`/movements/${id}`);
    },

    // Create new movement
    createMovement: async (data: CreateMovementRequest): Promise<Movement> => {
        return api.post<Movement>('/movements', data);
    },

    // Update movement
    updateMovement: async (id: string, data: Partial<UpdateMovementRequest>): Promise<Movement> => {
        return api.put<Movement>(`/movements/${id}`, data);
    },

    // Delete movement
    deleteMovement: async (id: string): Promise<void> => {
        return api.delete<void>(`/movements/${id}`);
    },

    // Helper functions for filtering
    movementFilters: {
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
    },
};
