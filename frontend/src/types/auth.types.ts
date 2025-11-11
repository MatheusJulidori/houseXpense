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

export interface AuthSessionResponse {
    user: User;
    csrfToken: string;
    accessTokenExpiresAt: string;
    refreshTokenExpiresAt: string;
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
    login: (credentials: LoginRequest) => Promise<AuthSessionResponse>;
    register: (userData: RegisterRequest) => Promise<AuthSessionResponse>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}
