import api from "./api";

export interface ReverseGeocodeResult {
  address: string;
  formattedAddress?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude: number;
  longitude: number;
}

export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult> => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    throw new Error('Latitude e longitude devem ser números válidos');
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error('Latitude deve estar entre -90 e 90');
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error('Longitude deve estar entre -180 e 180');
  }

  try {
    const response = await api.get<ReverseGeocodeResult>("/geo-location/decode", {
      params: { latitude, longitude },
    });

    return response.data;
  } catch (error: unknown) {
    console.error("Erro ao fazer reverse geocoding:", error);
    throw error;
  }
};

