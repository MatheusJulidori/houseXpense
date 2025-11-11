import type { Tag } from "./tag.types";

// Movement types
export type MovementType = 'INCOME' | 'EXPENSE';

export interface Movement {
    id: string;
    type: MovementType;
    date: string;
    description: string;
    amount: number;
    userId: string | null;
    tags: Tag[];
    createdAt: string;
}

export interface CreateMovementRequest {
    description: string;
    type: MovementType;
    amount: number;
    tags?: string[];
    date?: string;
}

export interface UpdateMovementRequest {
    id: string;
    description?: string;
    type?: MovementType;
    amount?: number;
    tags?: string[];
    date?: string;
}

export interface MovementFilters {
    tags?: string[];
    startDate?: string; // YYYY-MM-DD format
    endDate?: string; // YYYY-MM-DD format
    month?: number; // 1-12
    year?: number; // YYYY
    type?: MovementType;
}

export interface MovementQueryParams {
    tags?: string; // comma-separated string
    startDate?: string;
    endDate?: string;
    month?: number;
    year?: number;
    type?: MovementType;
}

// Time period helpers
export interface MonthYear {
    month: number; // 1-12
    year: number; // YYYY
}

export interface DateRange {
    start: string; // YYYY-MM-DD
    end: string; // YYYY-MM-DD
}
