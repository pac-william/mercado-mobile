import { useCallback, useRef, useState } from "react";
import * as Location from "expo-location";
import { usePermissions } from "./usePermissions";

interface Coordinates {
  latitude: number;
  longitude: number;
}

export const useUserLocation = () => {
  const permissions = usePermissions();
  const { location: locationPermission, showLocationAlert } = permissions;
  const [loading, setLoading] = useState(false);
  const cachedLocation = useRef<Coordinates | null>(null);

  const getUserLocation = useCallback(async (): Promise<Coordinates | null> => {
    if (cachedLocation.current) {
      return cachedLocation.current;
    }

    try {
      setLoading(true);

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
    } catch (error) {
      console.warn("Erro ao obter localização do usuário", error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [locationPermission, showLocationAlert]);

  return {
    getUserLocation,
    locationLoading: loading,
  };
};

