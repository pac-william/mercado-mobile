import {
  addItemToCart,
  getCartItems,
  getCartItemById,
  updateCartItemQuantity,
  removeCartItem,
} from '../../src/services/cartItemService';
import api from '../../src/services/api';

jest.mock('../../src/services/api');

const mockApi = api as jest.Mocked<typeof api>;

describe('cartItemService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addItemToCart', () => {
    it('deve adicionar item ao carrinho', async () => {
      const cartId = 'cart1';
      const item = {
        productId: 'p1',
        quantity: 2,
      };

      const mockResponse = {
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

      mockApi.post.mockResolvedValue({ data: mockResponse } as any);

      const result = await addItemToCart(cartId, item);

      expect(result).toEqual(mockResponse);
      expect(mockApi.post).toHaveBeenCalledWith(
        `/cart-items/${cartId}/items`,
        item
      );
    });

    it('deve lançar erro quando API falha', async () => {
      const cartId = 'cart1';
      const item = {
        productId: 'p1',
        quantity: 1,
      };

      const error = new Error('Erro ao adicionar');
      mockApi.post.mockRejectedValue(error);

      await expect(addItemToCart(cartId, item)).rejects.toThrow('Erro ao adicionar');
    });
  });

  describe('getCartItems', () => {
    it('deve retornar lista de itens do carrinho', async () => {
      const cartId = 'cart1';
      const mockResponse = [
        {
          id: 'item1',
          productId: 'p1',
          quantity: 2,
          product: {
            id: 'p1',
            name: 'Produto 1',
            price: 10.50,
            unit: 'un',
            image: 'img1.jpg',
            marketId: 'm1',
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'item2',
          productId: 'p2',
          quantity: 1,
          product: {
            id: 'p2',
            name: 'Produto 2',
            price: 20.00,
            unit: 'kg',
            image: 'img2.jpg',
            marketId: 'm1',
          },
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        },
      ];

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getCartItems(cartId);

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith(`/cart-items/${cartId}/items`);
    });

    it('deve retornar array vazio quando carrinho está vazio', async () => {
      const cartId = 'cart1';
      mockApi.get.mockResolvedValue({ data: [] } as any);

      const result = await getCartItems(cartId);

      expect(result).toEqual([]);
    });

    it('deve lançar erro quando API falha', async () => {
      const cartId = 'cart1';
      const error = new Error('Erro de rede');
      mockApi.get.mockRejectedValue(error);

      await expect(getCartItems(cartId)).rejects.toThrow('Erro de rede');
    });
  });

  describe('getCartItemById', () => {
    it('deve retornar item específico por ID', async () => {
      const itemId = 'item1';
      const mockResponse = {
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

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await getCartItemById(itemId);

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith(`/cart-items/items/${itemId}`);
    });

    it('deve lançar erro quando item não existe', async () => {
      const itemId = 'item999';
      const error = new Error('Item não encontrado');
      mockApi.get.mockRejectedValue(error);

      await expect(getCartItemById(itemId)).rejects.toThrow('Item não encontrado');
    });
  });

  describe('updateCartItemQuantity', () => {
    it('deve atualizar quantidade do item', async () => {
      const itemId = 'item1';
      const newQuantity = 5;

      const mockResponse = {
        id: 'item1',
        productId: 'p1',
        quantity: 5,
        product: {
          id: 'p1',
          name: 'Produto Teste',
          price: 15.50,
          unit: 'un',
          image: 'img.jpg',
          marketId: 'm1',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockApi.put.mockResolvedValue({ data: mockResponse } as any);

      const result = await updateCartItemQuantity(itemId, newQuantity);

      expect(result).toEqual(mockResponse);
      expect(result.quantity).toBe(5);
      expect(mockApi.put).toHaveBeenCalledWith(
        `/cart-items/items/${itemId}`,
        { quantity: newQuantity }
      );
    });

    it('deve permitir atualizar quantidade para zero', async () => {
      const itemId = 'item1';
      const mockResponse = {
        id: 'item1',
        productId: 'p1',
        quantity: 0,
        product: {
          id: 'p1',
          name: 'Produto Teste',
          price: 15.50,
          unit: 'un',
          image: 'img.jpg',
          marketId: 'm1',
        },
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-02T00:00:00Z',
      };

      mockApi.put.mockResolvedValue({ data: mockResponse } as any);

      const result = await updateCartItemQuantity(itemId, 0);

      expect(result.quantity).toBe(0);
    });

    it('deve lançar erro quando atualização falha', async () => {
      const itemId = 'item1';
      const error = new Error('Erro ao atualizar');
      mockApi.put.mockRejectedValue(error);

      await expect(updateCartItemQuantity(itemId, 3)).rejects.toThrow('Erro ao atualizar');
    });
  });

  describe('removeCartItem', () => {
    it('deve remover item do carrinho', async () => {
      const itemId = 'item1';
      mockApi.delete.mockResolvedValue({} as any);

      await removeCartItem(itemId);

      expect(mockApi.delete).toHaveBeenCalledWith(`/cart-items/items/${itemId}`);
    });

    it('deve lançar erro quando remoção falha', async () => {
      const itemId = 'item1';
      const error = new Error('Erro ao remover');
      mockApi.delete.mockRejectedValue(error);

      await expect(removeCartItem(itemId)).rejects.toThrow('Erro ao remover');
    });
  });
});

