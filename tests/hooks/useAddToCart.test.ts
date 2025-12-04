import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useAddToCart } from '../../src/hooks/useAddToCart';
import { useCart } from '../../src/contexts/CartContext';
import { useSession } from '../../src/hooks/useSession';
import { useLoading } from '../../src/hooks/useLoading';
import { addItemToCart } from '../../src/services/cartService';

jest.mock('../../src/contexts/CartContext');
jest.mock('../../src/hooks/useSession');
jest.mock('../../src/hooks/useLoading');
jest.mock('../../src/services/cartService');

const mockUseCart = useCart as jest.MockedFunction<typeof useCart>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseLoading = useLoading as jest.MockedFunction<typeof useLoading>;
const mockAddItemToCart = addItemToCart as jest.MockedFunction<typeof addItemToCart>;

describe('useAddToCart', () => {
  const mockAddItem = jest.fn();
  const mockExecute = jest.fn((fn) => fn());

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCart.mockReturnValue({
      state: {
        items: [],
        total: 0,
        itemCount: 0,
      },
      addItem: mockAddItem,
      removeItem: jest.fn(),
      updateQuantity: jest.fn(),
      clearCart: jest.fn(),
    });
    mockUseSession.mockReturnValue({
      user: null,
      token: null,
      session: null,
      isLoading: false,
      isAuthenticated: false,
      refreshSession: jest.fn(),
      clearSession: jest.fn(),
    });
    mockUseLoading.mockReturnValue({
      loading: false,
      setLoading: jest.fn(),
      startLoading: jest.fn(),
      stopLoading: jest.fn(),
      withLoading: jest.fn(),
      execute: mockExecute,
    });
  });

  describe('quando não autenticado', () => {
    it('deve adicionar item ao carrinho local', async () => {
      const { result } = renderHook(() => useAddToCart());

      const params = {
        productId: 'p1',
        productName: 'Produto Teste',
        price: 15.50,
        image: 'img.jpg',
        marketName: 'Mercado Teste',
        marketId: 'm1',
        quantity: 2,
      };

      await act(async () => {
        await result.current.addToCart(params);
      });

      expect(mockAddItem).toHaveBeenCalledWith({
        id: 'p1',
        name: 'Produto Teste',
        price: 15.50,
        image: 'img.jpg',
        marketName: 'Mercado Teste',
        marketId: 'm1',
        initialQuantity: 2,
      });
      expect(mockAddItemToCart).not.toHaveBeenCalled();
    });

    it('deve usar quantidade padrão quando não fornecida', async () => {
      const { result } = renderHook(() => useAddToCart());

      const params = {
        productId: 'p1',
        productName: 'Produto Teste',
        price: 15.50,
        image: 'img.jpg',
        marketName: 'Mercado Teste',
        marketId: 'm1',
      };

      await act(async () => {
        await result.current.addToCart(params);
      });

      expect(mockAddItem).toHaveBeenCalledWith(
        expect.objectContaining({
          initialQuantity: 1,
        })
      );
    });
  });

  describe('quando autenticado', () => {
    beforeEach(() => {
      mockUseSession.mockReturnValue({
        user: {
          id: 'u1',
          name: 'Usuário',
          email: 'teste@teste.com',
          auth0Id: 'auth0|123',
        },
        token: 'token',
        session: {
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
        isLoading: false,
        isAuthenticated: true,
        refreshSession: jest.fn(),
        clearSession: jest.fn(),
      });
    });

    it('deve adicionar item via API e ao carrinho local', async () => {
      const mockCartResponse = {
        id: 'cart1',
        userId: 'u1',
        marketId: 'm1',
        items: [
          {
            id: 'item1',
            productId: 'p1',
            quantity: 2,
            product: {
              id: 'p1',
              name: 'Produto Teste',
              price: 15.50,
              unit: 'un',
              image: 'img.jpg',
              marketId: 'm1',
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        totalItems: 2,
        totalValue: 31.00,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockAddItemToCart.mockResolvedValue(mockCartResponse);

      const { result } = renderHook(() => useAddToCart());

      const params = {
        productId: 'p1',
        productName: 'Produto Teste',
        price: 15.50,
        image: 'img.jpg',
        marketName: 'Mercado Teste',
        marketId: 'm1',
        quantity: 2,
      };

      await act(async () => {
        await result.current.addToCart(params);
      });

      expect(mockAddItemToCart).toHaveBeenCalledWith({
        productId: 'p1',
        quantity: 2,
      });
      expect(mockAddItem).toHaveBeenCalledWith({
        id: 'p1',
        name: 'Produto Teste',
        price: 15.50,
        image: 'img.jpg',
        marketName: 'Mercado Teste',
        marketId: 'm1',
        cartItemId: 'item1',
        initialQuantity: 2,
      });
    });

    it('deve adicionar localmente quando API falha', async () => {
      const apiError = new Error('Erro de rede');
      mockAddItemToCart.mockRejectedValue(apiError);

      const { result } = renderHook(() => useAddToCart());

      const params = {
        productId: 'p1',
        productName: 'Produto Teste',
        price: 15.50,
        image: 'img.jpg',
        marketName: 'Mercado Teste',
        marketId: 'm1',
      };

      await act(async () => {
        await result.current.addToCart(params);
      });

      expect(mockAddItem).toHaveBeenCalled();
    });

    it('deve chamar onSuccess quando fornecido', async () => {
      const onSuccess = jest.fn();
      mockAddItemToCart.mockResolvedValue({
        id: 'cart1',
        userId: 'u1',
        marketId: 'm1',
        items: [],
        totalItems: 0,
        totalValue: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      });

      const { result } = renderHook(() => useAddToCart({ onSuccess }));

      const params = {
        productId: 'p1',
        productName: 'Produto Teste',
        price: 15.50,
        image: 'img.jpg',
        marketName: 'Mercado Teste',
        marketId: 'm1',
      };

      await act(async () => {
        await result.current.addToCart(params);
      });

      expect(onSuccess).toHaveBeenCalled();
    });

    it('deve chamar onError quando API falha', async () => {
      const onError = jest.fn();
      const apiError = new Error('Erro de rede');
      mockAddItemToCart.mockRejectedValue(apiError);

      const { result } = renderHook(() => useAddToCart({ onError }));

      const params = {
        productId: 'p1',
        productName: 'Produto Teste',
        price: 15.50,
        image: 'img.jpg',
        marketName: 'Mercado Teste',
        marketId: 'm1',
      };

      await act(async () => {
        await result.current.addToCart(params);
      });

      expect(onError).toHaveBeenCalledWith(apiError);
    });
  });

  describe('isAdding', () => {
    it('deve retornar false quando não está adicionando', () => {
      mockUseLoading.mockReturnValue({
        loading: false,
        setLoading: jest.fn(),
        startLoading: jest.fn(),
        stopLoading: jest.fn(),
        withLoading: jest.fn(),
        execute: mockExecute,
      });

      const { result } = renderHook(() => useAddToCart());

      expect(result.current.isAdding).toBe(false);
    });

    it('deve retornar true quando está adicionando', () => {
      mockUseLoading.mockReturnValue({
        loading: true,
        setLoading: jest.fn(),
        startLoading: jest.fn(),
        stopLoading: jest.fn(),
        withLoading: jest.fn(),
        execute: mockExecute,
      });

      const { result } = renderHook(() => useAddToCart());

      expect(result.current.isAdding).toBe(true);
    });

    it('não deve adicionar quando já está adicionando', async () => {
      mockUseLoading.mockReturnValue({
        loading: true,
        setLoading: jest.fn(),
        startLoading: jest.fn(),
        stopLoading: jest.fn(),
        withLoading: jest.fn(),
        execute: mockExecute,
      });

      const { result } = renderHook(() => useAddToCart());

      const params = {
        productId: 'p1',
        productName: 'Produto Teste',
        price: 15.50,
        image: 'img.jpg',
        marketName: 'Mercado Teste',
        marketId: 'm1',
      };

      await act(async () => {
        await result.current.addToCart(params);
      });

      expect(mockAddItem).not.toHaveBeenCalled();
    });
  });
});

