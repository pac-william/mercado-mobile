import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { getToken, getUser, saveToken, saveUser, clearStorage } from '../utils/storage';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'RESTORE_TOKEN'; payload: { user: User | null; token: string | null } }
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
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

    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
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

  return (
    <AuthContext.Provider value={{ state, login, logout, restoreToken }}>
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

