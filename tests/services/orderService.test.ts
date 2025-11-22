import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  assignDeliverer,
} from '../../src/services/orderService';
import api from '../../src/services/api';
import * as orderStorage from '../../src/domain/order/orderStorage';

jest.mock('../../src/services/api');
jest.mock('../../src/domain/order/orderStorage');
jest.mock('expo-secure-store');
jest.mock('expo-sqlite');

const mockApi = api as jest.Mocked<typeof api>;
const mockOrderStorage = orderStorage as jest.Mocked<typeof orderStorage>;

describe('orderService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOrderStorage.initDB.mockResolvedValue(undefined);
  });

  describe('getOrders', () => {
    const mockOrder = {
      id: 'order1',
      userId: 'u1',
      marketId: 'm1',
      totalPrice: 100,
      status: 'PENDENTE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('deve buscar pedidos da API e salvar localmente', async () => {
      const mockResponse = {
        orders: [mockOrder],
        meta: {
          page: 1,
          size: 10,
          total: 1,
          totalPages: 1,
        },
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);
      mockOrderStorage.getOrders.mockResolvedValue([]);
      mockOrderStorage.saveOrder.mockResolvedValue(undefined);

      const result = await getOrders(1, 10, { userId: 'u1' });

      expect(result).toEqual(mockResponse);
      expect(mockApi.get).toHaveBeenCalledWith('/orders', {
        params: { page: 1, size: 10, userId: 'u1' },
      });
      expect(mockOrderStorage.saveOrder).toHaveBeenCalledWith(mockOrder);
    });

    it('deve retornar dados locais quando API falha', async () => {
      const localOrders = [mockOrder];
      const error = new Error('Erro de rede');

      mockApi.get.mockRejectedValue(error);
      mockOrderStorage.getOrders.mockResolvedValue(localOrders);

      const result = await getOrders(1, 10, { userId: 'u1' });

      expect(result.orders).toEqual(localOrders);
      expect(result.meta.page).toBe(1);
      expect(result.meta.total).toBe(1);
    });

    it('deve lançar erro se não tiver userId e API falhar', async () => {
      const error = new Error('Erro de rede');

      mockApi.get.mockRejectedValue(error);
      mockOrderStorage.getOrders.mockResolvedValue([]);

      await expect(getOrders(1, 10)).rejects.toThrow('É necessário fornecer userId para buscar pedidos offline');
    });

    it('deve lançar erro se não tiver dados locais e API falhar', async () => {
      const error = new Error('Erro de rede');

      mockApi.get.mockRejectedValue(error);
      mockOrderStorage.getOrders.mockResolvedValue([]);

      await expect(getOrders(1, 10, { userId: 'u1' })).rejects.toThrow('Erro de rede');
    });
  });

  describe('getOrderById', () => {
    const mockOrder = {
      id: 'order1',
      userId: 'u1',
      marketId: 'm1',
      totalPrice: 100,
      status: 'PENDENTE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('deve buscar pedido da API e salvar localmente', async () => {
      mockApi.get.mockResolvedValue({ data: mockOrder } as any);
      mockOrderStorage.getOrderById.mockResolvedValue(null);
      mockOrderStorage.saveOrder.mockResolvedValue(undefined);

      const result = await getOrderById('order1');

      expect(result).toEqual(mockOrder);
      expect(mockApi.get).toHaveBeenCalledWith('/orders/order1');
      expect(mockOrderStorage.saveOrder).toHaveBeenCalledWith(mockOrder);
    });

    it('deve retornar pedido local quando API falha', async () => {
      const error = new Error('Erro de rede');

      mockApi.get.mockRejectedValue(error);
      mockOrderStorage.getOrderById.mockResolvedValue(mockOrder);

      const result = await getOrderById('order1');

      expect(result).toEqual(mockOrder);
    });

    it('deve lançar erro se não tiver pedido local e API falhar', async () => {
      const error = new Error('Erro de rede');

      mockApi.get.mockRejectedValue(error);
      mockOrderStorage.getOrderById.mockResolvedValue(null);

      await expect(getOrderById('order1')).rejects.toThrow('Erro de rede');
    });
  });

  describe('createOrder', () => {
    const mockOrderData = {
      userId: 'u1',
      marketId: 'm1',
      items: [{ productId: 'p1', quantity: 2, price: 10 }],
      addressId: 'addr1',
    };

    const mockOrder = {
      id: 'order1',
      userId: 'u1',
      marketId: 'm1',
      totalPrice: 100,
      status: 'PENDENTE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('deve criar pedido na API e salvar localmente', async () => {
      mockApi.post.mockResolvedValue({ data: mockOrder } as any);
      mockOrderStorage.saveOrder.mockResolvedValue(undefined);

      const result = await createOrder(mockOrderData);

      expect(result).toEqual(mockOrder);
      expect(mockApi.post).toHaveBeenCalledWith('/orders', mockOrderData);
      expect(mockOrderStorage.saveOrder).toHaveBeenCalledWith(mockOrder);
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('Erro ao criar pedido');
      mockApi.post.mockRejectedValue(error);

      await expect(createOrder(mockOrderData)).rejects.toThrow('Erro ao criar pedido');
    });
  });

  describe('updateOrder', () => {
    const mockOrderData = {
      status: 'CONCLUIDO',
    };

    const mockOrder = {
      id: 'order1',
      userId: 'u1',
      marketId: 'm1',
      totalPrice: 100,
      status: 'CONCLUIDO',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('deve atualizar pedido na API e salvar localmente', async () => {
      mockApi.put.mockResolvedValue({ data: mockOrder } as any);
      mockOrderStorage.saveOrder.mockResolvedValue(undefined);

      const result = await updateOrder('order1', mockOrderData);

      expect(result).toEqual(mockOrder);
      expect(mockApi.put).toHaveBeenCalledWith('/orders/order1', mockOrderData);
      expect(mockOrderStorage.saveOrder).toHaveBeenCalledWith(mockOrder);
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('Erro ao atualizar');
      mockApi.put.mockRejectedValue(error);

      await expect(updateOrder('order1', mockOrderData)).rejects.toThrow('Erro ao atualizar');
    });
  });

  describe('assignDeliverer', () => {
    const mockData = {
      delivererId: 'd1',
    };

    const mockOrder = {
      id: 'order1',
      userId: 'u1',
      marketId: 'm1',
      delivererId: 'd1',
      totalPrice: 100,
      status: 'EM_ENTREGA',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    it('deve atribuir entregador e salvar localmente', async () => {
      mockApi.post.mockResolvedValue({ data: mockOrder } as any);
      mockOrderStorage.saveOrder.mockResolvedValue(undefined);

      const result = await assignDeliverer('order1', mockData);

      expect(result).toEqual(mockOrder);
      expect(mockApi.post).toHaveBeenCalledWith('/orders/order1/assign-deliverer', mockData);
      expect(mockOrderStorage.saveOrder).toHaveBeenCalledWith(mockOrder);
    });

    it('deve lançar erro quando API falha', async () => {
      const error = new Error('Erro ao atribuir entregador');
      mockApi.post.mockRejectedValue(error);

      await expect(assignDeliverer('order1', mockData)).rejects.toThrow('Erro ao atribuir entregador');
    });
  });
});

