import api from "./api";
import { Market, MarketPaginatedResponse } from "../domain/marketDomain"

export const getMarkets = async (page: number = 1, size: number = 20): Promise<MarketPaginatedResponse> => {

    const response = await api.get<MarketPaginatedResponse>("/markets", {
      params: { page, size },
    });

    return response.data;
}

export const getMarketById = async (id: string): Promise<Market> => {
    const response = await api.get<Market>(`/markets/${id}`);
    return response.data;
}

