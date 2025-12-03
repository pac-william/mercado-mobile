import api from "./api";
import { Category, CategoryPaginatedResponse } from "../domain/categoryDomain";
import { ProductPaginatedResponse } from "../domain/productDomain";

export const getCategories = async (page: number = 1, size: number = 20): Promise<CategoryPaginatedResponse> => {
    try {
        const response = await api.get<CategoryPaginatedResponse>("/categories", {
            params: { page, size },
        });
        return response.data;
    } catch (error: unknown) {
        console.error("Erro ao buscar categorias:", error);
        throw error;
    }
}

export const getCategoryById = async (id: string): Promise<Category> => {
    try {
        const response = await api.get<Category>(`/categories/${id}`);
        return response.data;
    } catch (error: unknown) {
        console.error(`Erro ao buscar categoria com ID ${id}:`, error);
        throw error;
    }
}

export const getProductsByCategory = async (categoryId: string, page: number = 1, size: number = 20): Promise<ProductPaginatedResponse> => {
    try {
        const response = await api.get<ProductPaginatedResponse>("/products", {
            params: { page, size, categoryId },
        });
        return response.data;
    } catch (error: unknown) {
        console.error(`Erro ao buscar produtos da categoria ${categoryId}:`, error);
        throw error;
    }
}