// Common API types
export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface ApiError {
    message: string;
    statusCode: number;
    error?: string;
}

export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

// Environment configuration
export interface ApiConfig {
    baseURL: string;
    timeout: number;
}
