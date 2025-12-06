import api from "./api";

export interface PaymentMethodsResponse {
  acceptsCreditCard: boolean;
  acceptsDebitCard: boolean;
  acceptsPix: boolean;
  acceptsCash: boolean;
  acceptsMealVoucher: boolean;
  acceptsFoodVoucher: boolean;
}

export const getMarketAcceptedPaymentMethods = async (
  marketId: string
): Promise<PaymentMethodsResponse> => {
  try {
    const response = await api.get<PaymentMethodsResponse>(
      `/payment-settings/market/${marketId}/accepted-methods`
    );
    return response.data;
  } catch (error: unknown) {
    console.error(`Erro ao buscar formas de pagamento do mercado ${marketId}:`, error);
    throw error;
  }
};

