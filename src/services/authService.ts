import api from "./api";
import { getAuth0IdFromToken, decodeJWT } from "../utils/jwtUtils";
import { auth0Config, useProxy } from "../config/auth0";
import * as AuthSession from 'expo-auth-session';

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
    idToken?: string;
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
                    idToken: idToken ? idToken : undefined,
                    user
                };
            }
        } catch (fetchError) {
            console.warn('Não foi possível buscar usuário completo, usando dados básicos:', fetchError);
        }
        
        return {
            token,
            idToken: idToken ? idToken : undefined,
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
        const registerResponse = await api.post<CreateUserResponse>("/auth/signup", {
            email: userData.email,
            password: userData.password,
            name: userData.name
        });
        
        
        const loginResponse = await api.post<GetTokenResponse>("/auth/signin", {
            username: userData.email,
            password: userData.password
        });
        
        const token = loginResponse.data.access_token;
        const idToken = loginResponse.data.id_token;
        const auth0Id = registerResponse.data.user_id;

        try {
            if (auth0Id) {
                const userResponse = await api.get<User>(`/users/auth0/${encodeURIComponent(auth0Id)}`);
                const user = userResponse.data;
                
                return {
                    token,
                    idToken: idToken || undefined,
                    user
                };
            }
        } catch (fetchError) {
            console.warn('Não foi possível buscar usuário completo, usando dados básicos:', fetchError);
        }
        
        return {
            token,
            idToken: idToken || undefined,
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

export const updateUserProfile = async (userId: string, profileData: ProfileUpdateRequest): Promise<User> => {
    try {
        const response = await api.put<User>(`/users/${encodeURIComponent(userId)}`, profileData);
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar perfil completo:", error);
        throw error;
    }
};

export const updateUserProfilePartial = async (userId: string, profileData: ProfileUpdateRequest): Promise<User> => {
    try {
        const response = await api.patch<User>(`/users/${encodeURIComponent(userId)}`, profileData);
        return response.data;
    } catch (error) {
        console.error("Erro ao atualizar perfil parcialmente:", error);
        throw error;
    }
};

export const loginWithGoogle = async (): Promise<AuthResponse> => {
    if (!auth0Config.clientId) {
        throw new Error('AUTH0_CLIENT_ID não configurado. Configure EXPO_PUBLIC_AUTH0_CLIENT_ID no arquivo .env');
    }


    try {
        const request = new AuthSession.AuthRequest({
            clientId: auth0Config.clientId,
            scopes: ['openid', 'profile', 'email'],
            responseType: AuthSession.ResponseType.Code,
            redirectUri: auth0Config.redirectUri,
            extraParams: {
                connection: 'google-oauth2',
            },
            usePKCE: true,
        });

        const discovery = {
            authorizationEndpoint: auth0Config.discovery.authorizationEndpoint,
            tokenEndpoint: auth0Config.discovery.tokenEndpoint,
        };

        const result = await request.promptAsync(discovery, {
            showInRecents: true,
        });

        if (result.type === 'cancel' || result.type === 'dismiss') {
            const cancelError = new Error('Login cancelado pelo usuário');
            cancelError.name = 'UserCancelled';
            throw cancelError;
        }

        if (result.type === 'error') {
            throw new Error(`Erro no OAuth: ${result.error?.message || 'Erro desconhecido'}`);
        }

        if (result.type !== 'success') {
            throw new Error('Resposta inesperada do Auth0');
        }

        let accessToken = '';
        let idToken = '';

        if (result.authentication) {
            accessToken = result.authentication.accessToken || '';
            idToken = result.authentication.idToken || accessToken;
        } else if (result.params?.code) {
            const code = result.params.code;
            const codeVerifier = request.codeVerifier || '';

            if (!codeVerifier) {
                throw new Error('Code verifier não encontrado para trocar código por tokens');
            }

            const tokenResponse = await fetch(auth0Config.discovery.tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: auth0Config.clientId,
                    code: code,
                    redirect_uri: auth0Config.redirectUri,
                    code_verifier: codeVerifier,
                }).toString(),
            });

            if (!tokenResponse.ok) {
                const errorText = await tokenResponse.text();
                console.error('Erro ao trocar código por tokens:', errorText);
                throw new Error('Erro ao trocar código de autorização por tokens');
            }

            const tokenData = await tokenResponse.json();
            accessToken = tokenData.access_token || '';
            idToken = tokenData.id_token || accessToken;
        } else {
            accessToken = result.params?.access_token || '';
            idToken = result.params?.id_token || accessToken;
        }

        if (!idToken && !accessToken) {
            throw new Error('Token não recebido na resposta');
        }

        let auth0Id: string | null = null;

        try {
            auth0Id = getAuth0IdFromToken(idToken);
        } catch (error) {
            console.warn('Não foi possível extrair auth0Id do token:', error);
            throw new Error('Erro ao processar token do Google');
        }

        try {
            const userResponse = await api.get<User>(`/users/auth0/${encodeURIComponent(auth0Id)}`);
            const user = userResponse.data;

            return {
                token: accessToken,
                idToken: idToken || undefined,
                user
            };
        } catch (error: any) {
            if (error.response?.status === 404) {
                const decoded = decodeJWT(idToken);
                
                const createUserPayload = {
                    name: decoded.name || decoded.email || 'Usuário',
                    email: decoded.email || '',
                    auth0Id: auth0Id,
                    profilePicture: decoded.picture || undefined,
                };

                await api.post<User>('/users', createUserPayload);

                const newUserResponse = await api.get<User>(`/users/auth0/${encodeURIComponent(auth0Id)}`);
                const user = newUserResponse.data;

                return {
                    token: accessToken,
                    idToken: idToken || undefined,
                    user
                };
            } else {
                throw error;
            }
        }
    } catch (error) {
        if (error instanceof Error && error.name === 'UserCancelled') {
            throw error;
        }
        throw error;
    }
};