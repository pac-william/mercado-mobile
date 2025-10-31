import api from "./api";
import {
  Order,
  OrderPaginatedResponse,
  OrderCreateDTO,
  OrderUpdateDTO,
  AssignDelivererDTO,
} from "../domain/orderDomain";
import { initDB, saveOrder, getOrders as getOrdersLocal, getOrderById as getOrderByIdLocal } from "../domain/order/orderStorage";


export const getOrders = async (
  page: number = 1,
  size: number = 10,
  filters?: { status?: string; userId?: string; marketId?: string; delivererId?: string }
): Promise<OrderPaginatedResponse> => {
  await initDB();

  // Sempre tenta carregar local primeiro para experiência offline
  let localOrders: Order[] = [];
  if (filters?.userId) {
    try {
      localOrders = await getOrdersLocal(filters.userId);
    } catch (error) {
      console.warn('Erro ao carregar pedidos locais:', error);
    }
  }

  // Tenta buscar da API para sincronizar
  try {
    const response = await api.get<OrderPaginatedResponse>("/orders", {
      params: { page, size, ...filters },
    });

    // Salva todos os pedidos recebidos localmente
    const orders = response.data.orders;
    for (const order of orders) {
      await saveOrder(order);
    }

    return response.data;
  } catch (error) {
    console.warn("⚠️ Falha ao buscar pedidos da API, usando dados locais:", error);

    // Se tiver dados locais, retorna eles
    if (localOrders.length > 0) {
      return {
        orders: localOrders,
        meta: {
          page: 1,
          size: localOrders.length,
          total: localOrders.length,
          totalPages: 1,
        },
      };
    }

    // Se não tiver userId, não pode buscar local
    if (!filters?.userId) {
      throw new Error("É necessário fornecer userId para buscar pedidos offline");
    }

    throw error;
  }
};


export const getOrderById = async (id: string): Promise<Order> => {
  await initDB();

  // Tenta buscar local primeiro
  const localOrder = await getOrderByIdLocal(id);
  

  // Tenta buscar da API para sincronizar
  try {
    const response = await api.get<Order>(`/orders/${id}`);
    await saveOrder(response.data);
    return response.data;
  } catch (error) {
    console.warn(`⚠️ Erro ao buscar pedido da API, usando dados locais:`, error);
    
    // Se tiver local, retorna
    if (localOrder) {
      return localOrder;
    }

    throw error;
  }
};


export const createOrder = async (orderData: OrderCreateDTO): Promise<Order> => {
  await initDB();

  try {
    // O token será adicionado automaticamente pelo interceptor da API
    const response = await api.post<Order>("/orders", orderData);

    // Sempre salva localmente após criar
    await saveOrder(response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao criar pedido:", error);
    throw error;
  }
};


export const updateOrder = async (id: string, orderData: OrderUpdateDTO): Promise<Order> => {
  await initDB();

  try {
    const response = await api.put<Order>(`/orders/${id}`, orderData);
    await saveOrder(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const assignDeliverer = async (id: string, data: AssignDelivererDTO): Promise<Order> => {
  try {
    const response = await api.post<Order>(`/orders/${id}/assign-deliverer`, data);
    await saveOrder(response.data);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atribuir entregador ao pedido ${id}:`, error);
    throw error;
  }
};
