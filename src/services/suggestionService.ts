import api from "./api";
import { Suggestion, SuggestionPaginatedResponse } from "../types/suggestion";

export interface SuggestionResponse {
  essential_products: string[];
  common_products: string[];
  utensils: string[];
}

export const getSuggestions = async (task: string): Promise<SuggestionResponse> => {
  if (!task.trim()) throw new Error("Tarefa não informada");

  try {
    const response = await api.get<SuggestionResponse>("/suggestions",
      { params: { task } }
    );

    return response.data;
  } catch (error: any) {
    console.error("Erro ao buscar sugestões:", error);
    throw new Error(
      error.response?.data?.message || "Erro ao buscar sugestões"
    );
  }
};

export const getUserSuggestions = async (
  page: number = 1,
  size: number = 10
): Promise<SuggestionPaginatedResponse> => {
  try {
    const response = await api.get<SuggestionPaginatedResponse>("/suggestions/user/me", {
      params: { page, size },
    });

    return response.data;
  } catch (error: any) {
    console.error("Erro ao buscar histórico de sugestões:", error);
    throw new Error(
      error.response?.data?.message || "Erro ao buscar histórico de sugestões"
    );
  }
};

export const getSuggestionById = async (id: string): Promise<Suggestion> => {
  try {
    const response = await api.get<Suggestion>(`/suggestions/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Erro ao buscar sugestão com ID ${id}:`, error);
    throw new Error(
      error.response?.data?.message || "Erro ao buscar sugestão"
    );
  }
};
