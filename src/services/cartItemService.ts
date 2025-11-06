import api from "./api";
import { CartItemResponse } from "./cartService";

export interface CartItemDTO {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemQuantityDTO {
  quantity: number;
}

/**
 * Adiciona um item ao carrinho especificado
 * @param cartId ID do carrinho
 * @param item Dados do item a ser adicionado
 * @returns Item adicionado ao carrinho
 */
export const addItemToCart = async (
  cartId: string,
  item: CartItemDTO
): Promise<CartItemResponse> => {
  try {
    const response = await api.post<CartItemResponse>(
      `/cart-items/${cartId}/items`,
      item
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao adicionar item ao carrinho:", error);
    throw error;
  }
};

/**
 * Lista todos os itens do carrinho especificado
 * @param cartId ID do carrinho
 * @returns Lista de itens do carrinho
 */
export const getCartItems = async (
  cartId: string
): Promise<CartItemResponse[]> => {
  try {
    const response = await api.get<CartItemResponse[]>(
      `/cart-items/${cartId}/items`
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar itens do carrinho:", error);
    throw error;
  }
};

/**
 * Busca um item específico do carrinho pelo seu ID
 * @param id ID do item do carrinho
 * @returns Item do carrinho
 */
export const getCartItemById = async (
  id: string
): Promise<CartItemResponse> => {
  try {
    const response = await api.get<CartItemResponse>(`/cart-items/items/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar item do carrinho com ID ${id}:`, error);
    throw error;
  }
};

/**
 * Atualiza a quantidade de um item específico no carrinho
 * @param id ID do item do carrinho
 * @param quantity Nova quantidade
 * @returns Item atualizado
 */
export const updateCartItemQuantity = async (
  id: string,
  quantity: number
): Promise<CartItemResponse> => {
  try {
    const response = await api.put<CartItemResponse>(
      `/cart-items/items/${id}`,
      { quantity }
    );
    return response.data;
  } catch (error) {
    console.error(`Erro ao atualizar quantidade do item ${id}:`, error);
    throw error;
  }
};

/**
 * Remove um item específico do carrinho pelo seu ID
 * @param id ID do item do carrinho
 */
export const removeCartItem = async (id: string): Promise<void> => {
  try {
    await api.delete(`/cart-items/items/${id}`);
  } catch (error) {
    console.error(`Erro ao remover item do carrinho ${id}:`, error);
    throw error;
  }
};

