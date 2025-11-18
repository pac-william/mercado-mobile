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
  const response = await api.get<ReverseGeocodeResult>("/geo-location/decode", {
    params: { latitude, longitude },
  });

  return response.data;
};

