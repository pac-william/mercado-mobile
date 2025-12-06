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

export interface MarketStatusResponse {
  isOpen: boolean;
  message?: string;
}

export const checkMarketStatus = async (marketId: string): Promise<MarketStatusResponse> => {
  try {
    // Tenta buscar o endpoint de status, se não existir, assume que está aberto
    const response = await api.get<MarketStatusResponse>(`/markets/${marketId}/status`);
    return response.data;
  } catch (error: any) {
    // Se o endpoint não existir (404), assume que está aberto
    // A validação real será feita no backend ao criar o pedido
    if (error?.response?.status === 404) {
      return { isOpen: true };
    }
    console.error(`Erro ao verificar status do mercado ${marketId}:`, error);
    // Em caso de outro erro, assume que está aberto para não bloquear o usuário
    return { isOpen: true };
  }
};

export interface OpeningHours {
  dayOfWeek: number | null; // 0-6 (0=Domingo, 6=Sábado) ou null para feriados
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
  isClosed: boolean;
  isOpen?: boolean; // Status atual do horário
  isHoliday?: boolean;
  holidayDate?: string | null;
  startTime?: string;
  endTime?: string;
}

export interface MarketOperatingHoursResponse {
  is24Hours: boolean;
  hours?: OpeningHours[];
  isOpen?: boolean;
  currentStatus?: string;
}

export const getMarketOpeningHours = async (marketId: string): Promise<MarketOperatingHoursResponse | null> => {
  try {
    const response = await api.get<MarketOperatingHoursResponse>(`/market-operating-hours/market/${marketId}`);
    return response.data;
  } catch (error: any) {
    // Se o endpoint não existir (404), retorna null
    if (error?.response?.status === 404) {
      console.warn(`Endpoint de horários não encontrado para mercado ${marketId}`);
      return null;
    }
    console.error(`Erro ao buscar horário de funcionamento do mercado ${marketId}:`, error);
    if (error?.response?.data) {
      console.error('Detalhes do erro:', error.response.data);
    }
    return null;
  }
};

