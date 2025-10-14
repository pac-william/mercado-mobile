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

export interface ForgotPasswordRequest {
    email: string;
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

interface BackendLoginResponse {
    message: string;
    role: string;
    id: string;
    marketId: string | null;
    market: any;
    accessToken: string;
    refreshToken: string;
}

interface BackendRegisterResponse {
    message: string;
    userId: string;
    role: string;
    marketId: string | null;
}

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
        const response = await api.post<BackendLoginResponse>("/auth/login", credentials);
        const data = response.data;
        
        return {
            token: data.accessToken,
            user: {
                id: data.id,
                name: credentials.email.split('@')[0],
                email: credentials.email
            }
        };
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        throw error;
    }
};

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
        await api.post<BackendRegisterResponse>("/auth/register/user", userData);
        
        const loginResponse = await login({
            email: userData.email,
            password: userData.password
        });
        
        return {
            token: loginResponse.token,
            user: {
                ...loginResponse.user,
                name: userData.name
            }
        };
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

export const forgotPassword = async (data: ForgotPasswordRequest): Promise<{ message: string }> => {
    try {
        const response = await api.post<{ message: string }>("/auth/forgot-password", data);
        return response.data;
    } catch (error) {
        console.error("Erro ao solicitar recuperação de senha:", error);
        throw error;
    }
};