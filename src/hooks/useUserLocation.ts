import { useCallback, useRef } from "react";
import * as Location from "expo-location";
import { usePermissions } from "./usePermissions";
import { useLoading } from "./useLoading";

interface Coordinates {
  latitude: number;
  longitude: number;
}

export const useUserLocation = () => {
  const permissions = usePermissions();
  const { location: locationPermission, showLocationAlert } = permissions;
  const { loading, execute } = useLoading();
  const cachedLocation = useRef<Coordinates | null>(null);

  const getUserLocation = useCallback(async (): Promise<Coordinates | null> => {
    if (cachedLocation.current) {
      return cachedLocation.current;
    }

    return execute(async () => {
      try {
        let granted = locationPermission.granted;
        if (!granted) {
          granted = await locationPermission.request();
        }

        if (!granted) {
          showLocationAlert();
          return null;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        cachedLocation.current = coords;
        return coords;
      } catch (error: unknown) {
        console.warn("Erro ao obter localização do usuário", error);
        return null;
      }
    });
  }, [locationPermission, showLocationAlert, execute]);

  return {
    getUserLocation,
    locationLoading: loading,
  };
};

