import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { getToken, getUser, saveToken, saveUser, clearStorage } from '../utils/storage';
import { updateUserProfile, updateUserProfilePartial, uploadProfilePicture } from '../services/authService';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profilePicture?: string;
  birthDate?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isUpdatingProfile: boolean;
  updateError: string | null;
}

type AuthAction =
  | { type: 'RESTORE_TOKEN'; payload: { user: User | null; token: string | null } }
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_PROFILE_START' }
  | { type: 'UPDATE_PROFILE_SUCCESS'; payload: { user: User } }
  | { type: 'UPDATE_PROFILE_FAILURE'; payload: { error: string } };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isUpdatingProfile: false,
  updateError: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.token,
        isLoading: false,
      };

    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'UPDATE_PROFILE_START':
      return {
        ...state,
        isUpdatingProfile: true,
        updateError: null,
      };

    case 'UPDATE_PROFILE_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isUpdatingProfile: false,
        updateError: null,
      };

    case 'UPDATE_PROFILE_FAILURE':
      return {
        ...state,
        isUpdatingProfile: false,
        updateError: action.payload.error,
      };

    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
  updateProfile: (profileData: { name?: string; email?: string; phone?: string; address?: string }) => Promise<void>;
  updateProfilePartial: (profileData: { name?: string; email?: string; phone?: string; address?: string }) => Promise<void>;
  uploadProfilePicture: (file: any) => Promise<void>;
  clearUpdateError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    restoreToken();
  }, []);

  const restoreToken = async () => {
    try {
      const token = await getToken();
      const user = await getUser();

      if (token && user) {
        dispatch({ type: 'RESTORE_TOKEN', payload: { user, token } });
      } else {
        dispatch({ type: 'RESTORE_TOKEN', payload: { user: null, token: null } });
      }
    } catch (error) {
      console.error('Erro ao restaurar token:', error);
      dispatch({ type: 'RESTORE_TOKEN', payload: { user: null, token: null } });
    }
  };

  const login = async (user: User, token: string) => {
    try {
      await saveToken(token);
      await saveUser(user);
      dispatch({ type: 'LOGIN', payload: { user, token } });
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await clearStorage();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData: { name?: string; email?: string; phone?: string; address?: string; birthDate?: string }) => {
    if (!state.token) {
      throw new Error('Usuário não autenticado');
    }

    console.log('Tentando atualizar perfil com token:', state.token.substring(0, 20) + '...'); // Log parcial do token

    // Formatar dados antes de enviar
    const formattedData = { ...profileData };

    // Formatar birthDate de DD/MM/AAAA para YYYY-MM-DD
    if (formattedData.birthDate) {
      const dateParts = formattedData.birthDate.split('/');
      if (dateParts.length === 3) {
        formattedData.birthDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
      }
    }

    // Garantir que telefone tenha pelo menos 10 caracteres (adicionar código de área se necessário)
    if (formattedData.phone && formattedData.phone.length < 10) {
      formattedData.phone = `11${formattedData.phone}`; // Exemplo: adicionar DDD 11 para São Paulo
    }

    console.log('Dados formatados enviados:', formattedData);

    dispatch({ type: 'UPDATE_PROFILE_START' });

    try {
      const updatedUser = await updateUserProfile(state.token, formattedData);
      await saveUser(updatedUser);
      dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: { user: updatedUser } });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
      dispatch({ type: 'UPDATE_PROFILE_FAILURE', payload: { error: errorMessage } });
      throw error;
    }
  };

  const updateProfilePartial = async (profileData: { name?: string; email?: string; phone?: string; address?: string; birthDate?: string }) => {
    if (!state.token) {
      throw new Error('Usuário não autenticado');
    }

    // Formatar dados antes de enviar
    const formattedData = { ...profileData };

    // Formatar birthDate de DD/MM/AAAA para YYYY-MM-DD
    if (formattedData.birthDate) {
      const dateParts = formattedData.birthDate.split('/');
      if (dateParts.length === 3) {
        formattedData.birthDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
      }
    }

    // Garantir que telefone tenha pelo menos 10 caracteres
    if (formattedData.phone && formattedData.phone.length < 10) {
      formattedData.phone = `11${formattedData.phone}`;
    }

    dispatch({ type: 'UPDATE_PROFILE_START' });

    try {
      const updatedUser = await updateUserProfilePartial(state.token, formattedData);
      await saveUser(updatedUser);
      dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: { user: updatedUser } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar perfil parcialmente';
      dispatch({ type: 'UPDATE_PROFILE_FAILURE', payload: { error: errorMessage } });
      throw error;
    }
  };

  const uploadProfilePictureHandler = async (file: any) => {
    if (!state.token) {
      throw new Error('Usuário não autenticado');
    }

    dispatch({ type: 'UPDATE_PROFILE_START' });

    try {
      const result = await uploadProfilePicture(state.token, file);
      const updatedUser = { ...state.user!, profilePicture: result.profilePicture };
      await saveUser(updatedUser);
      dispatch({ type: 'UPDATE_PROFILE_SUCCESS', payload: { user: updatedUser } });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer upload da foto';
      dispatch({ type: 'UPDATE_PROFILE_FAILURE', payload: { error: errorMessage } });
      throw error;
    }
  };

  const clearUpdateError = () => {
    dispatch({ type: 'UPDATE_PROFILE_FAILURE', payload: { error: null } });
  };

  return (
    <AuthContext.Provider value={{
      state,
      login,
      logout,
      restoreToken,
      updateProfile,
      updateProfilePartial,
      uploadProfilePicture: uploadProfilePictureHandler,
      clearUpdateError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


