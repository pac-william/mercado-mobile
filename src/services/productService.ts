import api from "./api";

export interface Product {
  id: string;
  name: string;
  price: number;
  marketId: string;
  image: string;
}

interface ProductResponse {
  products: Product[];
  total?: number;
}

export const getProducts = async (
  page: number = 1,
  size: number = 20,
  marketId?: string,     // <-- agora aceita opcional
  name?: string,
  minPrice?: number,
  maxPrice?: number
): Promise<ProductResponse> => {
  try {
    const response = await api.get<ProductResponse>("/products", {
      params: {
        page,
        size,
        marketId,   
        name,
        minPrice,
        maxPrice,
      },
    });

    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
