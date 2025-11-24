import api from "./api";
import { Market, MarketPaginatedResponse } from "../domain/marketDomain";

export const getMarkets = async (
  page: number = 1,
  size: number = 20,
  name?: string,
  userLatitude?: number,
  userLongitude?: number
): Promise<MarketPaginatedResponse> => {
  const params: Record<string, any> = { page, size };

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
};

export const getMarketById = async (id: string): Promise<Market> => {
  const response = await api.get<Market>(`/markets/${id}`);
  return response.data;
};

