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

export interface ProfileUpdateRequest {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    profilePicture?: string;
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

        // Buscar dados completos do usuário após login
        const userResponse = await api.get<User>("/auth/me", {
            headers: {
                Authorization: `Bearer ${data.accessToken}`
            }
        });

        return {
            token: data.accessToken,
            user: userResponse.data
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

export const getUserProfile = async (token: string): Promise<User> => {
    try {
        const response = await api.get<User>("/auth/me", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao obter perfil do usuário:", error);
        throw error;
    }
};

export const updateUserProfile = async (token: string, profileData: ProfileUpdateRequest): Promise<User> => {
    try {
        const response = await api.put<User>("/auth/me", profileData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar perfil completo:", error);
        throw error;
    }
};

export const updateUserProfilePartial = async (token: string, profileData: ProfileUpdateRequest): Promise<User> => {
    try {
        const response = await api.patch<User>("/auth/me", profileData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar perfil parcialmente:", error);
        throw error;
    }
};

export const uploadProfilePicture = async (token: string, file: any): Promise<{ profilePicture: string }> => {
    try {
        const formData = new FormData();
        formData.append("profilePicture", file);

        const response = await api.post<{ profilePicture: string }>("/auth/upload-profile-picture", formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao fazer upload da foto de perfil:", error);
        throw error;
    }
};

export const getProfileHistory = async (token: string): Promise<any[]> => {
    try {
        const response = await api.get<any[]>("/auth/profile-history", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao obter histórico do perfil:", error);
        throw error;
    }
};