import api from "./api";
import {
  Order,
  OrderPaginatedResponse,
  OrderCreateDTO,
  OrderUpdateDTO,
  AssignDelivererDTO,
} from "../domain/orderDomain";
import { initDB, saveOrder, getOrders as getOrdersLocal } from "../domain/order/orderStorage";


export const getOrders = async (
  page: number = 1,
  size: number = 10,
  filters?: { status?: string; userId?: string; marketId?: string; delivererId?: string }
): Promise<OrderPaginatedResponse> => {
  await initDB();

  try {
    const response = await api.get<OrderPaginatedResponse>("/orders", {
      params: { page, size, ...filters },
    });

    const orders = response.data.orders;
    for (const order of orders) {
      await saveOrder(order);
    }

    return response.data;
  } catch (error) {
    console.warn("⚠️ Falha ao buscar pedidos da API, usando dados locais:", error);

    if (filters?.userId) {
      const localOrders = await getOrdersLocal(filters.userId);
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

    throw error;
  }
};


export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const response = await api.get<Order>(`/orders/${id}`);
    await saveOrder(response.data);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar pedido com ID ${id}:`, error);
    throw error;
  }
};


export const createOrder = async (orderData: OrderCreateDTO, token: string): Promise<Order> => {
  try {
    const response = await api.post<Order>("/orders", orderData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await saveOrder(response.data);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar pedido:", error);
    throw error;
  }
};


export const updateOrder = async (id: string, orderData: OrderUpdateDTO): Promise<Order> => {
  try {
    const response = await api.put<Order>(`/orders/${id}`, orderData);
    await saveOrder(response.data);
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar pedido com ID ${id}:`, error);
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
