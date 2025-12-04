import {
  getCart,
  addItemToCart,
  addMultipleItemsToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  mapCartItemResponseToCartItem,
  CartResponse,
  CartItemResponse,
} from '../../src/services/cartService';
import api from '../../src/services/api';

jest.mock('../../src/services/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('cartService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('deve retornar array de carrinhos', async () => {
      const mockCarts: CartResponse[] = [
        {
          id: '1',
          userId: 'u1',
          marketId: 'm1',
          items: [],
          totalItems: 0,
          totalValue: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockApi.get.mockResolvedValue({ data: mockCarts } as any);

      const result = await getCart();

      expect(result).toEqual(mockCarts);
      expect(mockApi.get).toHaveBeenCalledWith('/cart');
      expect(mockApi.get).toHaveBeenCalledTimes(1);
    });

    it('deve converter objeto único em array', async () => {
      const mockCart: CartResponse = {
        id: '1',
        userId: 'u1',
        marketId: 'm1',
        items: [],
        totalItems: 0,
        totalValue: 0,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockApi.get.mockResolvedValue({ data: mockCart } as any);

      const result = await getCart();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(mockCart);
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('Erro de rede');
      mockApi.get.mockRejectedValue(error);

      await expect(getCart()).rejects.toThrow('Erro de rede');
      expect(mockApi.get).toHaveBeenCalledWith('/cart');
    });
  });

  describe('addItemToCart', () => {
    it('deve adicionar item ao carrinho', async () => {
      const mockCart: CartResponse = {
        id: '1',
        userId: 'u1',
        marketId: 'm1',
        items: [
          {
            id: 'item1',
            productId: 'p1',
            quantity: 1,
            product: {
              id: 'p1',
              name: 'Produto',
              price: 10,
              unit: 'un',
              image: 'img.jpg',
              marketId: 'm1',
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        totalItems: 1,
        totalValue: 10,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockApi.post.mockResolvedValue({ data: mockCart } as any);

      const result = await addItemToCart({ productId: 'p1', quantity: 1 });

      expect(result).toEqual(mockCart);
      expect(mockApi.post).toHaveBeenCalledWith('/cart/items', { productId: 'p1', quantity: 1 });
      expect(mockApi.post).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('Erro ao adicionar');
      mockApi.post.mockRejectedValue(error);

      await expect(addItemToCart({ productId: 'p1', quantity: 1 })).rejects.toThrow('Erro ao adicionar');
    });
  });

  describe('addMultipleItemsToCart', () => {
    it('deve adicionar múltiplos itens ao carrinho', async () => {
      const mockCarts: CartResponse[] = [
        {
          id: '1',
          userId: 'u1',
          marketId: 'm1',
          items: [],
          totalItems: 2,
          totalValue: 30,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockApi.post.mockResolvedValue({ data: mockCarts } as any);

      const result = await addMultipleItemsToCart({
        items: [
          { productId: 'p1', quantity: 1 },
          { productId: 'p2', quantity: 2 },
        ],
      });

      expect(result).toEqual(mockCarts);
      expect(mockApi.post).toHaveBeenCalledWith('/cart/items/multiple', {
        items: [
          { productId: 'p1', quantity: 1 },
          { productId: 'p2', quantity: 2 },
        ],
      });
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('Erro ao adicionar múltiplos itens');
      mockApi.post.mockRejectedValue(error);

      await expect(
        addMultipleItemsToCart({ items: [{ productId: 'p1', quantity: 1 }] })
      ).rejects.toThrow('Erro ao adicionar múltiplos itens');
    });
  });

  describe('updateCartItem', () => {
    it('deve atualizar quantidade do item', async () => {
      const mockCart: CartResponse = {
        id: '1',
        userId: 'u1',
        marketId: 'm1',
        items: [
          {
            id: 'item1',
            productId: 'p1',
            quantity: 5,
            product: {
              id: 'p1',
              name: 'Produto',
              price: 10,
              unit: 'un',
              image: 'img.jpg',
              marketId: 'm1',
            },
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
          },
        ],
        totalItems: 1,
        totalValue: 50,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockApi.put.mockResolvedValue({ data: mockCart } as any);

      const result = await updateCartItem('item1', 5);

      expect(result).toEqual(mockCart);
      expect(mockApi.put).toHaveBeenCalledWith('/cart/items/item1', { quantity: 5 });
      expect(mockApi.put).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('Erro ao atualizar');
      mockApi.put.mockRejectedValue(error);

      await expect(updateCartItem('item1', 5)).rejects.toThrow('Erro ao atualizar');
    });
  });

  describe('removeCartItem', () => {
    it('deve remover item do carrinho', async () => {
      mockApi.delete.mockResolvedValue({} as any);

      await removeCartItem('item1');

      expect(mockApi.delete).toHaveBeenCalledWith('/cart/items/item1');
      expect(mockApi.delete).toHaveBeenCalledTimes(1);
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('Erro ao remover');
      mockApi.delete.mockRejectedValue(error);

      await expect(removeCartItem('item1')).rejects.toThrow('Erro ao remover');
    });
  });

  describe('clearCart', () => {
    it('deve limpar todos os carrinhos', async () => {
      const mockCarts: CartResponse[] = [
        {
          id: '1',
          userId: 'u1',
          marketId: 'm1',
          items: [],
          totalItems: 0,
          totalValue: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          userId: 'u1',
          marketId: 'm2',
          items: [],
          totalItems: 0,
          totalValue: 0,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockApi.get.mockResolvedValue({ data: mockCarts } as any);
      mockApi.delete.mockResolvedValue({} as any);

      await clearCart();

      expect(mockApi.get).toHaveBeenCalledWith('/cart');
      expect(mockApi.delete).toHaveBeenCalledWith('/cart?cartId=1');
      expect(mockApi.delete).toHaveBeenCalledWith('/cart?cartId=2');
      expect(mockApi.delete).toHaveBeenCalledTimes(2);
    });

    it('não deve deletar nada se carrinho estiver vazio', async () => {
      mockApi.get.mockResolvedValue({ data: [] } as any);

      await clearCart();

      expect(mockApi.get).toHaveBeenCalledWith('/cart');
      expect(mockApi.delete).not.toHaveBeenCalled();
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('Erro ao limpar');
      mockApi.get.mockRejectedValue(error);

      await expect(clearCart()).rejects.toThrow('Erro ao limpar');
    });
  });

  describe('mapCartItemResponseToCartItem', () => {
    const mockCartItemResponse: CartItemResponse = {
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
    };

    it('deve converter CartItemResponse em CartItem sem getMarketName', () => {
      const result = mapCartItemResponseToCartItem(mockCartItemResponse);

      expect(result).toEqual({
        id: 'p1',
        name: 'Produto Teste',
        price: 15.50,
        image: 'img.jpg',
        marketName: 'Mercado',
        quantity: 2,
        marketId: 'm1',
        cartItemId: 'item1',
      });
    });

    it('deve usar marketName quando fornecido', () => {
      const result = mapCartItemResponseToCartItem(mockCartItemResponse, 'Supermercado ABC');

      expect(result.marketName).toBe('Supermercado ABC');
    });

    it('deve usar nome padrão quando marketName não fornecido', () => {
      const result = mapCartItemResponseToCartItem(mockCartItemResponse);

      expect(result.marketName).toBe('Mercado');
    });
  });
});

