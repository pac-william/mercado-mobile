import api from "./api";

export interface Campaign {
  id: string;
  marketId: string;
  title: string;
  imageUrl: string;
  slot: number;
  startDate: string;
  endDate: string | null;
  status: "DRAFT" | "SCHEDULED" | "ACTIVE" | "EXPIRED";
  createdAt: string;
  updatedAt: string;
}

export const getActiveCampaignsForCarousel = async (marketId?: string): Promise<Campaign[]> => {
  try {
    const params: any = {};
    if (marketId) {
      params.marketId = marketId;
    }

    const response = await api.get<Campaign[]>("/campaigns/carousel", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao buscar campanhas:", error);
    return [];
  }
};

