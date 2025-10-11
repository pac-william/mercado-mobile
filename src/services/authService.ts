import api from "./api";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
        const response = await api.post<AuthResponse>("/auth/login", credentials);
        return response.data;
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        throw error;
    }
};

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
        const response = await api.post<AuthResponse>("/auth/register", userData);
        return response.data;
    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        throw error;
    }
};

export const verifyToken = async (token: string): Promise<User> => {
    try {
        const response = await api.get<User>("/auth/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao verificar token:", error);
        throw error;
    }
};

