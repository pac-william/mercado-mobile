import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { UserProfileProvider, useUserProfile } from '../../src/contexts/UserProfileContext';
import { useSession } from '../../src/hooks/useSession';
import { getUserMe } from '../../src/services/userService';
import api from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('../../src/hooks/useSession');
jest.mock('../../src/services/userService');
jest.mock('../../src/services/api');
jest.mock('@react-native-async-storage/async-storage');

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockGetUserMe = getUserMe as jest.MockedFunction<typeof getUserMe>;
const mockApi = api as jest.Mocked<typeof api>;
const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UserProfileProvider>{children}</UserProfileProvider>
);

describe('UserProfileContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.multiGet.mockResolvedValue([
      ['@user_profile_cache_v1', null],
      ['@user_profile_cache_ts_v1', null],
      ['@user_profile_local_photo_v1', null],
      ['@user_profile_local_photo_ts_v1', null],
    ]);
    mockAsyncStorage.multiSet.mockResolvedValue();
    mockAsyncStorage.multiRemove.mockResolvedValue();
    mockUseSession.mockReturnValue({
      session: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,
      refreshSession: jest.fn(),
      clearSession: jest.fn(),
    });
  });

  describe('useUserProfile', () => {
    it('deve retornar valores iniciais', () => {
      const { result } = renderHook(() => useUserProfile(), { wrapper });

      expect(result.current.profile).toBeNull();
      expect(result.current.displayPhoto).toBeNull();
      expect(result.current.localPhoto).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('deve carregar perfil quando autenticado', async () => {
      const mockUser = {
        id: 'u1',
        name: 'Usuário Teste',
        email: 'teste@teste.com',
        profilePicture: 'https://example.com/photo.jpg',
        auth0Id: 'auth0|123',
      };

      mockUseSession.mockReturnValue({
        session: {
          user: {
            sub: 'auth0|123',
            name: 'Usuário Teste',
            given_name: 'Usuário',
            family_name: 'Teste',
            nickname: 'usuario.teste',
            email: 'teste@teste.com',
            email_verified: true,
            picture: 'https://example.com/photo.jpg',
          },
          tokenSet: {
            idToken: 'token',
            accessToken: 'access-token',
            scope: 'openid profile email',
            requestedScope: 'openid profile email',
            refreshToken: 'refresh-token',
            expiresAt: Date.now() + 3600000,
          },
          internal: {
            sid: 'session-id',
            createdAt: Date.now(),
          },
          exp: Date.now() + 3600000,
        },
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        token: 'token',
        refreshSession: jest.fn(),
        clearSession: jest.fn(),
      });

      mockGetUserMe.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useUserProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      }, { timeout: 1000 });

      expect(mockGetUserMe).toHaveBeenCalled();
    });

    it('deve limpar perfil quando não autenticado', async () => {
      mockUseSession.mockReturnValue({
        session: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null,
        refreshSession: jest.fn(),
        clearSession: jest.fn(),
      });

      const { result } = renderHook(() => useUserProfile(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).toBeNull();
      });
    });

    it('deve atualizar perfil localmente', async () => {
      const mockUser = {
        id: 'u1',
        name: 'Usuário Atualizado',
        email: 'teste@teste.com',
        auth0Id: 'auth0|123',
      };

      const { result } = renderHook(() => useUserProfile(), { wrapper });

      await act(async () => {
        await result.current.applyProfileUpdate(mockUser);
      });

      expect(result.current.profile).toEqual(mockUser);
      expect(mockAsyncStorage.multiSet).toHaveBeenCalled();
    });

    it('deve definir foto local', async () => {
      const { result } = renderHook(() => useUserProfile(), { wrapper });

      await act(async () => {
        await result.current.setLocalPhoto('file://local-photo.jpg');
      });

      expect(result.current.localPhoto).toBe('file://local-photo.jpg');
      expect(mockAsyncStorage.multiSet).toHaveBeenCalled();
    });

    it('deve remover foto local', async () => {
      const { result } = renderHook(() => useUserProfile(), { wrapper });

      await act(async () => {
        await result.current.setLocalPhoto('file://local-photo.jpg');
        await result.current.setLocalPhoto(null);
      });

      expect(result.current.localPhoto).toBeNull();
      expect(mockAsyncStorage.multiRemove).toHaveBeenCalled();
    });

    it('deve usar foto de sessão quando disponível', () => {
      mockUseSession.mockReturnValue({
        session: {
          user: {
            sub: 'auth0|123',
            name: 'Usuário',
            given_name: 'Usuário',
            family_name: '',
            nickname: 'usuario',
            email: 'teste@teste.com',
            email_verified: true,
            picture: 'https://example.com/session-photo.jpg',
          },
          tokenSet: {
            idToken: 'token',
            accessToken: 'access-token',
            scope: 'openid profile email',
            requestedScope: 'openid profile email',
            refreshToken: 'refresh-token',
            expiresAt: Date.now() + 3600000,
          },
          internal: {
            sid: 'session-id',
            createdAt: Date.now(),
          },
          exp: Date.now() + 3600000,
        },
        user: {
          id: 'u1',
          name: 'Usuário',
          email: 'teste@teste.com',
          auth0Id: 'auth0|123',
        },
        isAuthenticated: true,
        isLoading: false,
        token: 'token',
        refreshSession: jest.fn(),
        clearSession: jest.fn(),
      });

      const { result } = renderHook(() => useUserProfile(), { wrapper });

      expect(result.current.displayPhoto).toBe('https://example.com/session-photo.jpg');
    });

    it('deve criar usuário quando não existe no backend', async () => {
      const mockUser = {
        id: 'u1',
        name: 'Usuário Novo',
        email: 'novo@teste.com',
        auth0Id: 'auth0|123',
      };

      mockUseSession.mockReturnValue({
        session: {
          user: {
            sub: 'auth0|123',
            name: 'Usuário Novo',
            given_name: 'Usuário',
            family_name: 'Novo',
            nickname: 'usuario.novo',
            email: 'novo@teste.com',
            email_verified: true,
            picture: '',
          },
          tokenSet: {
            idToken: 'token',
            accessToken: 'access-token',
            scope: 'openid profile email',
            requestedScope: 'openid profile email',
            refreshToken: 'refresh-token',
            expiresAt: Date.now() + 3600000,
          },
          internal: {
            sid: 'session-id',
            createdAt: Date.now(),
          },
          exp: Date.now() + 3600000,
        },
        user: null,
        isAuthenticated: true,
        isLoading: false,
        token: 'token',
        refreshSession: jest.fn(),
        clearSession: jest.fn(),
      });

      const error = { response: { status: 404 } };
      mockGetUserMe.mockRejectedValueOnce(error);
      mockApi.post.mockResolvedValue({ data: mockUser } as any);
      mockGetUserMe.mockResolvedValue(mockUser);

      const { result } = renderHook(() => useUserProfile(), { wrapper });

      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalled();
      }, { timeout: 2000 });
    });
  });
});

