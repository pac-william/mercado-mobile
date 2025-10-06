import axios from "axios";

export interface SuggestionResponse {
  essential_products: string[];
  common_products: string[];
  utensils: string[];
}

export const getSuggestions = async (task: string): Promise<SuggestionResponse> => {
  if (!task.trim()) throw new Error("Tarefa não informada");

  try {
    const response = await axios.get<SuggestionResponse>("/suggestions",
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
