import api from "./api";
import { Market, MarketPaginatedResponse } from "../domain/marketDomain";

interface MarketParams {
  page: number;
  size: number;
  name?: string;
  userLatitude?: number;
  userLongitude?: number;
}

export const getMarkets = async (
  page: number = 1,
  size: number = 20,
  name?: string,
  userLatitude?: number,
  userLongitude?: number
): Promise<MarketPaginatedResponse> => {
  try {
    const params: MarketParams = { page, size };

    if (name) {
      params.name = name;
    }

    if (typeof userLatitude === "number") {
      params.userLatitude = userLatitude;
    }

    if (typeof userLongitude === "number") {
      params.userLongitude = userLongitude;
    }

    const response = await api.get<MarketPaginatedResponse>("/markets", { params });

    return response.data;
  } catch (error: unknown) {
    console.error("Erro ao buscar mercados:", error);
    throw error;
  }
};

export const getMarketById = async (id: string): Promise<Market> => {
  try {
    const response = await api.get<Market>(`/markets/${id}`);
    return response.data;
  } catch (error: unknown) {
    console.error(`Erro ao buscar mercado com ID ${id}:`, error);
    throw error;
  }
};

