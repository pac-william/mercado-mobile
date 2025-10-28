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
        console.log('Tentando fazer login com:', credentials.email);
        console.log('Base URL da API:', api.defaults.baseURL);
        const response = await api.post<GetTokenResponse>("/auth/signin", {
            username: credentials.email,
            password: credentials.password
        });
        
        console.log('Resposta do login:', response.data);
        const data = response.data;

        // Tentar buscar dados completos do usuário após login
        try {
            const userResponse = await api.get<User>("/auth/me", {
                headers: {
                    Authorization: `Bearer ${data.access_token}`
                }
            });

            return {
                token: data.access_token,
                user: userResponse.data
            };
        } catch (meError) {
            console.log("Endpoint /auth/me não disponível, usando dados do token");
            return {
                token: data.access_token,
                user: {
                    id: credentials.email,
                    name: "",
                    email: credentials.email
                }
            };
        }
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
        const response = await api.post<CreateUserResponse>("/auth/signup", {
            email: userData.email,
            password: userData.password,
            name: userData.name
        });
        
        console.log('Resposta do registro:', response.data);
        const createUserData = response.data;
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
    } catch (error: any) {
        console.error("Erro ao registrar usuário:", error);
        console.error("Status:", error.response?.status);
        console.error("Data:", error.response?.data);
        console.error("URL tentada:", error.config?.url);
        
        // Tratar erro específico de usuário duplicado
        if (error.response?.status === 500 && error.response?.data?.message?.includes("Erro interno")) {
            const retryError = new Error("Este email já está cadastrado");
            retryError.name = "EmailAlreadyExists";
            throw retryError;
        }
        
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