import api from "./api";
import { Suggestion, SuggestionPaginatedResponse } from "../types/suggestion";

export interface SuggestionResponse {
  suggestionId: string;
  essential_products: string[];
  common_products: string[];
  utensils: string[];
}

interface CreateSuggestionResponse {
  id: string;
}

const convertSuggestionToResponse = (suggestion: Suggestion): Omit<SuggestionResponse, 'suggestionId'> => {
  const essential_products: string[] = [];
  const common_products: string[] = [];
  const utensils: string[] = [];

  if (suggestion.data?.items) {
    suggestion.data.items.forEach((item) => {
      if (item.type === "essential") {
        essential_products.push(item.name);
      } else if (item.type === "common") {
        common_products.push(item.name);
      } else if (item.type === "utensil") {
        utensils.push(item.name);
      }
    });
  }

  return {
    essential_products,
    common_products,
    utensils,
  };
};

export const createSuggestion = async (task: string): Promise<CreateSuggestionResponse> => {
  if (!task.trim()) throw new Error("Tarefa não informada");

  try {
    const response = await api.post<CreateSuggestionResponse>("/suggestions", { task });
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Erro ao criar sugestão"
    );
  }
};

export const getSuggestions = async (task: string): Promise<SuggestionResponse> => {
  if (!task.trim()) throw new Error("Tarefa não informada");

  try {
    const createResponse = await createSuggestion(task);
    const suggestion = await getSuggestionById(createResponse.id);
    return {
      suggestionId: createResponse.id,
      ...convertSuggestionToResponse(suggestion),
    };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || error.message || "Erro ao buscar sugestões"
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
