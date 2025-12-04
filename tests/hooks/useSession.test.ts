import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSession } from '../../src/hooks/useSession';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store');

const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('useSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSecureStore.getItemAsync.mockResolvedValue(null);
    mockSecureStore.deleteItemAsync.mockResolvedValue();
  });

  describe('loadSession', () => {
    it('deve retornar sessão quando existe no storage', async () => {
      const mockSession = {
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
          idToken: 'token123',
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
      };

      mockSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(mockSession));

      const { result } = renderHook(() => useSession());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session).toEqual(mockSession);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe('token123');
    });

    it('deve retornar null quando não há sessão', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const { result } = renderHook(() => useSession());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.token).toBeNull();
    });

    it('deve tratar erro ao fazer parse da sessão', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue('invalid-json');

      const { result } = renderHook(() => useSession());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session).toBeNull();
    });

    it('deve tratar erro ao carregar do storage', async () => {
      mockSecureStore.getItemAsync.mockRejectedValue(new Error('Erro de storage'));

      const { result } = renderHook(() => useSession());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.session).toBeNull();
    });
  });

  describe('user', () => {
    it('deve mapear dados do usuário da sessão', async () => {
      const mockSession = {
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
          idToken: 'token123',
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
      };

      mockSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(mockSession));

      const { result } = renderHook(() => useSession());

      await waitFor(() => {
        expect(result.current.user).not.toBeNull();
      });

      expect(result.current.user).toEqual({
        id: 'auth0|123',
        name: 'Usuário Teste',
        email: 'teste@teste.com',
        profilePicture: 'https://example.com/photo.jpg',
        auth0Id: 'auth0|123',
      });
    });

    it('deve retornar null quando não há usuário na sessão', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const { result } = renderHook(() => useSession());

      await waitFor(() => {
        expect(result.current.user).toBeNull();
      });
    });
  });

  describe('isAuthenticated', () => {
    it('deve retornar true quando há sessão e token', async () => {
      const mockSession = {
        user: {
          sub: 'auth0|123',
          name: 'Usuário',
          given_name: 'Usuário',
          family_name: '',
          nickname: 'usuario',
          email: 'teste@teste.com',
          email_verified: true,
          picture: '',
        },
        tokenSet: {
          idToken: 'token123',
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
      };

      mockSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(mockSession));

      const { result } = renderHook(() => useSession());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });
    });

    it('deve retornar false quando não há sessão', async () => {
      mockSecureStore.getItemAsync.mockResolvedValue(null);

      const { result } = renderHook(() => useSession());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });
    });

    it('deve retornar false quando não há token', async () => {
      const mockSession = {
        user: {
          sub: 'auth0|123',
          name: 'Usuário',
          given_name: 'Usuário',
          family_name: '',
          nickname: 'usuario',
          email: 'teste@teste.com',
          email_verified: true,
          picture: '',
        },
        tokenSet: {
          idToken: null as any,
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
      };

      mockSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(mockSession));

      const { result } = renderHook(() => useSession());

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false);
      });
    });
  });

  describe('refreshSession', () => {
    it('deve recarregar sessão do storage', async () => {
      const { result } = renderHook(() => useSession());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newSession = {
        user: {
          sub: 'auth0|456',
          name: 'Novo Usuário',
          given_name: 'Novo',
          family_name: 'Usuário',
          nickname: 'novo.usuario',
          email: 'novo@teste.com',
          email_verified: true,
          picture: '',
        },
        tokenSet: {
          idToken: 'new-token',
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
      };

      mockSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(newSession));

      await act(async () => {
        await result.current.refreshSession();
      });

      await waitFor(() => {
        expect(result.current.session).toEqual(newSession);
      });
    });
  });

  describe('clearSession', () => {
    it('deve limpar sessão do storage', async () => {
      const mockSession = {
        user: {
          sub: 'auth0|123',
          name: 'Usuário',
          given_name: 'Usuário',
          family_name: '',
          nickname: 'usuario',
          email: 'teste@teste.com',
          email_verified: true,
          picture: '',
        },
        tokenSet: {
          idToken: 'token123',
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
      };

      mockSecureStore.getItemAsync.mockResolvedValue(JSON.stringify(mockSession));

      const { result } = renderHook(() => useSession());

      await waitFor(() => {
        expect(result.current.session).not.toBeNull();
      });

      await act(async () => {
        await result.current.clearSession();
      });

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalledWith('session');
      expect(result.current.session).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('deve tratar erro ao limpar sessão', async () => {
      mockSecureStore.deleteItemAsync.mockRejectedValue(new Error('Erro ao deletar'));

      const { result } = renderHook(() => useSession());

      await act(async () => {
        await result.current.clearSession();
      });

      expect(mockSecureStore.deleteItemAsync).toHaveBeenCalled();
    });
  });
});

