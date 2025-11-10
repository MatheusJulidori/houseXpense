// Auth types
export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
}

export interface User {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    createdAt: string;
}

export interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (credentials: LoginRequest) => Promise<void>;
    register: (userData: RegisterRequest) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}
