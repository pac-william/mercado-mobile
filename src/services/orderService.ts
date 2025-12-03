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

  let localOrders: Order[] = [];
  if (filters?.userId) {
    try {
      localOrders = await getOrdersLocal(filters.userId);
    } catch (error: unknown) {
      console.warn('Erro ao carregar pedidos locais:', error);
    }
  }

  try {
    const response = await api.get<OrderPaginatedResponse>("/orders", {
      params: { page, size, ...filters },
    });

    if (response.data && Array.isArray(response.data.orders)) {
      for (const order of response.data.orders) {
        await saveOrder(order);
      }

      if (response.data.orders.length > 0 || localOrders.length === 0) {
        return response.data;
      }

      return {
        orders: localOrders,
        meta: response.data.meta || {
          page: 1,
          size: localOrders.length,
          total: localOrders.length,
          totalPages: 1,
        },
      };
    }

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

    return {
      orders: [],
      meta: {
        page: 1,
        size: 0,
        total: 0,
        totalPages: 0,
      },
    };
  } catch (error: unknown) {
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

    if (!filters?.userId) {
      throw new Error("É necessário fornecer userId para buscar pedidos offline");
    }

    throw error;
  }
};

export const getOrderById = async (id: string): Promise<Order> => {
  await initDB();

  const localOrder = await getOrderByIdLocal(id);

  try {
    const response = await api.get<Order>(`/orders/${id}`);
    await saveOrder(response.data);
    return response.data;
  } catch (error: unknown) {
    console.warn('Erro ao buscar pedido da API, usando dados locais:', error);
    
    if (localOrder) {
      return localOrder;
    }

    throw error;
  }
};

export const createOrder = async (orderData: OrderCreateDTO): Promise<Order> => {
  await initDB();

  try {
    const response = await api.post<Order>("/orders", orderData);
    await saveOrder(response.data);
    return response.data;
  } catch (error: unknown) {
    console.error("Erro ao criar pedido:", error);
    throw error;
  }
};

export const updateOrder = async (id: string, orderData: OrderUpdateDTO): Promise<Order> => {
  await initDB();

  try {
    const response = await api.put<Order>(`/orders/${id}`, orderData);
    await saveOrder(response.data);
    return response.data;
  } catch (error: unknown) {
    throw error;
  }
};

export const assignDeliverer = async (id: string, data: AssignDelivererDTO): Promise<Order> => {
  await initDB();

  try {
    const response = await api.post<Order>(`/orders/${id}/assign-deliverer`, data);
    await saveOrder(response.data);
    return response.data;
  } catch (error: unknown) {
    console.error(`Erro ao atribuir entregador ao pedido ${id}:`, error);
    throw error;
  }
};
