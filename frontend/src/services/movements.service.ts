import { api } from './api';
import type {
    Movement,
    CreateMovementRequest,
    UpdateMovementRequest,
    MovementQueryParams,
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
};
