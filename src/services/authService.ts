import api from "./api";
import { getAuth0IdFromToken } from "../utils/jwtUtils";

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
    auth0Id?: string;
    birthDate?: string | Date;
    gender?: string;
    role?: 'CUSTOMER' | 'MARKET_ADMIN';
    marketId?: string;
    market?: {
        id: string;
        name: string;
        address: string;
        profilePicture?: string;
    };
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface AuthResponse {
    token: string;
    user: User;
}

interface GetTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    id_token?: string;
}

interface CreateUserResponse {
    user_id: string;
    email: string;
    name: string;
}

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
        const response = await api.post<GetTokenResponse>("/auth/signin", {
            username: credentials.email,
            password: credentials.password
        });
        
        const token = response.data.access_token;
        const idToken = response.data.id_token;

        try {
            let auth0Id: string | null = null;

            if (idToken) {
                try {
                    auth0Id = getAuth0IdFromToken(idToken);
                } catch (error) {
                    console.warn('Não foi possível decodificar id_token:', error);
                }
            }

            if (!auth0Id && token) {
                try {
                    auth0Id = getAuth0IdFromToken(token);
                } catch (error) {
                    console.warn('Não foi possível decodificar access_token:', error);
                }
            }

            if (auth0Id) {
                const userResponse = await api.get<User>(`/users/auth0/${encodeURIComponent(auth0Id)}`);
                const user = userResponse.data;
                
                return {
                    token,
                    user
                };
            }
        } catch (fetchError) {
            console.warn('Não foi possível buscar usuário completo, usando dados básicos:', fetchError);
        }
        
        return {
            token,
            user: {
                id: credentials.email,
                name: "",
                email: credentials.email
            }
        };

    } catch (error: any) {
        console.error("Erro ao fazer login:", error);
        console.error("Status:", error.response?.status);
        console.error("Data:", error.response?.data);
        console.error("URL tentada:", error.config?.url);
        throw error;
    }
};

export const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
        console.log('Tentando registrar usuário:', userData.email);
        console.log('Base URL da API:', api.defaults.baseURL);
        const registerResponse = await api.post<CreateUserResponse>("/auth/signup", {
            email: userData.email,
            password: userData.password,
            name: userData.name
        });
        
        console.log('Resposta do registro:', registerResponse.data);
        
        const loginResponse = await api.post<GetTokenResponse>("/auth/signin", {
            username: userData.email,
            password: userData.password
        });
        
        const token = loginResponse.data.access_token;
        const auth0Id = registerResponse.data.user_id;

        try {
            if (auth0Id) {
                const userResponse = await api.get<User>(`/users/auth0/${encodeURIComponent(auth0Id)}`);
                const user = userResponse.data;
                
                return {
                    token,
                    user
                };
            }
        } catch (fetchError) {
            console.warn('Não foi possível buscar usuário completo, usando dados básicos:', fetchError);
        }
        
        return {
            token,
            user: {
                id: userData.email,
                name: userData.name,
                email: userData.email
            }
        };
    } catch (error: any) {
        console.error("Erro ao registrar usuário:", error);
        console.error("Status:", error.response?.status);
        console.error("Data:", error.response?.data);
        console.error("URL tentada:", error.config?.url);
        
        if (error.response?.status === 500 && error.response?.data?.message?.includes("Erro interno")) {
            const retryError = new Error("Este email já está cadastrado");
            retryError.name = "EmailAlreadyExists";
            throw retryError;
        }
        
        throw error;
    }
};

export const verifyToken = async (): Promise<User> => {
    try {
        const response = await api.get<User>("/auth/me");
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

export const getUserProfile = async (): Promise<User> => {
    try {
        const response = await api.get<User>("/auth/me");
        return response.data;
    } catch (error) {
        console.error("Erro ao obter perfil do usuário:", error);
        throw error;
    }
};

export const updateUserProfile = async (profileData: ProfileUpdateRequest): Promise<User> => {
    try {
        const response = await api.put<User>("/auth/me", profileData);
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar perfil completo:", error);
        throw error;
    }
};

export const updateUserProfilePartial = async (profileData: ProfileUpdateRequest): Promise<User> => {
    try {
        const response = await api.patch<User>("/auth/me", profileData);
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar perfil parcialmente:", error);
        throw error;
    }
};

export const uploadProfilePicture = async (file: any): Promise<{ profilePicture: string }> => {
    try {
        const formData = new FormData();
        formData.append("profilePicture", file);

        const response = await api.post<{ profilePicture: string }>("/auth/upload-profile-picture", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao fazer upload da foto de perfil:", error);
        throw error;
    }
};

export const getProfileHistory = async (): Promise<any[]> => {
    try {
        const response = await api.get<any[]>("/auth/profile-history");
        return response.data;
    } catch (error) {
        console.error("Erro ao obter histórico do perfil:", error);
        throw error;
    }
};