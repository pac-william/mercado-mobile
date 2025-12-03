import api from "./api";

export interface Product {
  id: string;
  name: string;
  price: number;
  marketId: string;
  image?: string;
  unit?: string;
}

interface ProductResponse {
  products: Product[];
  total?: number;
}

export const getProducts = async (
  page: number = 1,
  size: number = 20,
  marketId?: string,    
  name?: string,
  minPrice?: number,
  maxPrice?: number,
  categoryIds?: string | string[]
): Promise<ProductResponse> => {
  try {
    const normalizedCategoryIds = Array.isArray(categoryIds)
      ? categoryIds.filter(Boolean)
      : categoryIds
        ? [categoryIds]
        : [];

    const response = await api.get<ProductResponse>("/products", {
      params: {
        page,
        size,
        marketId,   
        name,
        minPrice,
        maxPrice,
        categoryId: normalizedCategoryIds.length ? normalizedCategoryIds : undefined,
      },
      paramsSerializer: {
        serialize: (params) => {
          const searchParams = new URLSearchParams();
          Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null) {
              return;
            }
            if (Array.isArray(value)) {
              value.forEach((item) => {
                if (item !== undefined && item !== null) {
                  searchParams.append(key, String(item));
                }
              });
            } else {
              searchParams.append(key, String(value));
            }
          });
          return searchParams.toString();
        },
      },
    });

    return response.data;
  } catch (error: unknown) {
    console.error("Erro ao buscar produtos:", error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.error(`Erro ao buscar produto com ID ${id}:`, error);
    throw error;
  }
};