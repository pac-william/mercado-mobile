import { CartItem } from "../contexts/CartContext";
import api from "./api";

export interface CartItemDTO {
  productId: string;
  quantity: number;
}

export interface CartItemResponse {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    image: string;
    marketId: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  id: string;
  userId: string;
  marketId: string;
  marketName?: string;
  items: CartItemResponse[];
  totalItems: number;
  totalValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface AddMultipleItemsDTO {
  items: CartItemDTO[];
}

export const getCart = async (): Promise<CartResponse[]> => {
  try {
    const response = await api.get<CartResponse[]>("/cart");
    const data = response.data;
    if (Array.isArray(data)) {
      return data;
    }
    return [data];
  } catch (error: unknown) {
    console.error("Erro ao buscar carrinho:", error);
    throw error;
  }
};

export const addItemToCart = async (item: CartItemDTO): Promise<CartResponse> => {
  try {
    const response = await api.post<CartResponse>("/cart/items", item);
    return response.data;
  } catch (error: unknown) {
    console.error("Erro ao adicionar item ao carrinho:", error);
    throw error;
  }
};

export const addMultipleItemsToCart = async (items: AddMultipleItemsDTO): Promise<CartResponse[]> => {
  try {
    const response = await api.post<CartResponse[]>("/cart/items/multiple", items);
    return response.data;
  } catch (error: unknown) {
    console.error("Erro ao adicionar múltiplos itens ao carrinho:", error);
    throw error;
  }
};

export const updateCartItem = async (itemId: string, quantity: number): Promise<CartResponse> => {
  try {
    const response = await api.put<CartResponse>(`/cart/items/${itemId}`, { quantity });
    return response.data;
  } catch (error: unknown) {
    console.error("Erro ao atualizar item do carrinho:", error);
    throw error;
  }
};

export const removeCartItem = async (itemId: string): Promise<void> => {
  try {
    await api.delete(`/cart/items/${itemId}`);
  } catch (error: unknown) {
    console.error("Erro ao remover item do carrinho:", error);
    throw error;
  }
};

export const clearCart = async (): Promise<void> => {
  try {
    const carts = await getCart();
    if (carts.length > 0) {
      await Promise.all(
        carts.map(cart => api.delete(`/cart?cartId=${cart.id}`))
      );
    }
  } catch (error: unknown) {
    console.error("Erro ao limpar carrinho:", error);
    throw error;
  }
};

export const mapCartItemResponseToCartItem = (
  item: CartItemResponse,
  marketName?: string
): CartItem => {
  return {
    id: item.productId,
    name: item.product.name,
    price: item.product.price,
    image: item.product.image,
    marketName: marketName || "Mercado",
    quantity: item.quantity,
    marketId: item.product.marketId,
    cartItemId: item.id,
  };
};

