import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { getToken, getUser, saveToken, saveUser, clearStorage } from '../utils/storage';
import { updateUserProfile, updateUserProfilePartial, uploadProfilePicture } from '../services/authService';
import {
    getUserAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setAddressFavorite,
    getFavoriteAddress,
    getActiveAddresses,
    AddressResponseDTO
} from '../services/addressService';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profilePicture?: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isFavorite: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isUpdatingProfile: boolean;
  updateError: string | null;
  addresses: Address[];
  favoriteAddress: Address | null;
  isLoadingAddresses: boolean;
  addressesError: string | null;
}

type AuthAction =
  | { type: 'RESTORE_TOKEN'; payload: { user: User | null; token: string | null } }
  | { type: 'LOGIN'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_PROFILE_START' }
  | { type: 'UPDATE_PROFILE_SUCCESS'; payload: { user: User } }
  | { type: 'UPDATE_PROFILE_FAILURE'; payload: { error: string } }
  | { type: 'LOAD_ADDRESSES_START' }
  | { type: 'LOAD_ADDRESSES_SUCCESS'; payload: { addresses: Address[]; favoriteAddress: Address | null } }
  | { type: 'LOAD_ADDRESSES_FAILURE'; payload: { error: string } }
  | { type: 'ADD_ADDRESS_SUCCESS'; payload: { address: Address } }
  | { type: 'UPDATE_ADDRESS_SUCCESS'; payload: { address: Address } }
  | { type: 'DELETE_ADDRESS_SUCCESS'; payload: { addressId: string } }
  | { type: 'SET_FAVORITE_ADDRESS_SUCCESS'; payload: { address: Address } };

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isUpdatingProfile: false,
  updateError: null,
  addresses: [],
  favoriteAddress: null,
  isLoadingAddresses: false,
  addressesError: null,
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

    case 'LOAD_ADDRESSES_START':
      return {
        ...state,
        isLoadingAddresses: true,
        addressesError: null,
      };

    case 'LOAD_ADDRESSES_SUCCESS':
      return {
        ...state,
        addresses: action.payload.addresses,
        favoriteAddress: action.payload.favoriteAddress,
        isLoadingAddresses: false,
        addressesError: null,
      };

    case 'LOAD_ADDRESSES_FAILURE':
      return {
        ...state,
        isLoadingAddresses: false,
        addressesError: action.payload.error,
      };

    case 'ADD_ADDRESS_SUCCESS':
      return {
        ...state,
        addresses: [...state.addresses, action.payload.address],
      };

    case 'UPDATE_ADDRESS_SUCCESS':
      return {
        ...state,
        addresses: state.addresses.map(addr =>
          addr.id === action.payload.address.id ? action.payload.address : addr
        ),
        favoriteAddress: state.favoriteAddress?.id === action.payload.address.id
          ? action.payload.address
          : state.favoriteAddress,
      };

    case 'DELETE_ADDRESS_SUCCESS':
      return {
        ...state,
        addresses: state.addresses.filter(addr => addr.id !== action.payload.addressId),
        favoriteAddress: state.favoriteAddress?.id === action.payload.addressId
          ? null
          : state.favoriteAddress,
      };

    case 'SET_FAVORITE_ADDRESS_SUCCESS':
      return {
        ...state,
        addresses: state.addresses.map(addr => ({
          ...addr,
          isFavorite: addr.id === action.payload.address.id
        })),
        favoriteAddress: action.payload.address,
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
  getUserAddresses: () => Promise<void>;
  addAddress: (addressData: any) => Promise<void>;
  updateAddress: (id: string, addressData: any) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
  setAddressFavorite: (id: string, isFavorite: boolean) => Promise<void>;
  getFavoriteAddress: () => Promise<void>;
  clearAddressesError: () => void;
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

  
    const formattedData: any = {};


    Object.keys(profileData).forEach(key => {
      const value = (profileData as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        formattedData[key] = value;
      }
    });

    if (formattedData.birthDate) {
      const dateParts = formattedData.birthDate.split('/');
      if (dateParts.length === 3) {
        formattedData.birthDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
      }
    }

  
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

  
    const formattedData: any = {};

    Object.keys(profileData).forEach(key => {
      const value = (profileData as any)[key];
      if (value !== null && value !== undefined && value !== '') {
        formattedData[key] = value;
      }
    });

  
    if (formattedData.birthDate) {
      const dateParts = formattedData.birthDate.split('/');
      if (dateParts.length === 3) {
        formattedData.birthDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
      }
    }

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

  const getUserAddresses = async () => {
    if (!state.token) {
      throw new Error('Usuário não autenticado');
    }

    dispatch({ type: 'LOAD_ADDRESSES_START' });

    try {
      const addressesResponse = await getUserAddresses();
      const favoriteResponse = await getFavoriteAddress();

      dispatch({
        type: 'LOAD_ADDRESSES_SUCCESS',
        payload: {
          addresses: addressesResponse.addresses,
          favoriteAddress: favoriteResponse
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar endereços';
      dispatch({ type: 'LOAD_ADDRESSES_FAILURE', payload: { error: errorMessage } });
      throw error;
    }
  };

  const addAddress = async (addressData: any) => {
    if (!state.token) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const newAddress = await createAddress(addressData);
      dispatch({ type: 'ADD_ADDRESS_SUCCESS', payload: { address: newAddress } });
    } catch (error) {
      console.error('Erro ao adicionar endereço:', error);
      throw error;
    }
  };

  const updateAddress = async (id: string, addressData: any) => {
    if (!state.token) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const updatedAddress = await updateAddress(id, addressData);
      dispatch({ type: 'UPDATE_ADDRESS_SUCCESS', payload: { address: updatedAddress } });
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
      throw error;
    }
  };

  const deleteAddress = async (id: string) => {
    if (!state.token) {
      throw new Error('Usuário não autenticado');
    }

    try {
      await deleteAddress(id);
      dispatch({ type: 'DELETE_ADDRESS_SUCCESS', payload: { addressId: id } });
    } catch (error) {
      console.error('Erro ao deletar endereço:', error);
      throw error;
    }
  };

  const setAddressFavorite = async (id: string, isFavorite: boolean) => {
    if (!state.token) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const updatedAddress = await setAddressFavorite(id, isFavorite);
      dispatch({ type: 'SET_FAVORITE_ADDRESS_SUCCESS', payload: { address: updatedAddress } });
    } catch (error) {
      console.error('Erro ao definir endereço favorito:', error);
      throw error;
    }
  };

  const getFavoriteAddress = async () => {
    if (!state.token) {
      throw new Error('Usuário não autenticado');
    }

    try {
      const favoriteAddress = await getFavoriteAddress();
      dispatch({ type: 'SET_FAVORITE_ADDRESS_SUCCESS', payload: { address: favoriteAddress } });
    } catch (error) {
      console.error('Erro ao buscar endereço favorito:', error);
      throw error;
    }
  };

  const clearAddressesError = () => {
    dispatch({ type: 'LOAD_ADDRESSES_FAILURE', payload: { error: null } });
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
      clearUpdateError,
      getUserAddresses,
      addAddress,
      updateAddress,
      deleteAddress,
      setAddressFavorite,
      getFavoriteAddress,
      clearAddressesError
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


