import api from "./api";

import { Market, MarketPaginatedResponse } from "../domain/marketDomain"
import { MarketDTO } from "../dtos/marketDTO"

export const getMarkets = async (page: number = 1, size: number = 20): Promise<MarketPaginatedResponse> => {

    const response = await api.get<MarketPaginatedResponse>("/markets", {
      params: { page, size },
    });

    return response.data;
}

// export const getMarketById = async (id: string) => {
//     const response = await fetch(`${baseUrl}/api/v1/markets/${id}`)
//     const data = await response.json() as Market
//     return data
// }

// export const createMarket = async (market: MarketDTO) => {
//     const response = await fetch(`${baseUrl}/api/v1/markets`, {
//         method: "POST",
//         body: JSON.stringify(market),
//         headers: {
//             "Content-Type": "application/json"
//         }
//     })
//     const data = await response.json() as Market
//     return data
// }