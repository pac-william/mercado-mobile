const toRadians = (value: number): number => (value * Math.PI) / 180;

const isValidCoordinate = (value: number): boolean => {
  return Number.isFinite(value) && !Number.isNaN(value);
};

const isValidLatitude = (lat: number): boolean => {
  return isValidCoordinate(lat) && lat >= -90 && lat <= 90;
};

const isValidLongitude = (lon: number): boolean => {
  return isValidCoordinate(lon) && lon >= -180 && lon <= 180;
};

export const calculateDistanceInKm = (
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number => {
  if (
    !isValidLatitude(latitudeA) ||
    !isValidLongitude(longitudeA) ||
    !isValidLatitude(latitudeB) ||
    !isValidLongitude(longitudeB)
  ) {
    return NaN;
  }

  const earthRadiusKm = 6371;

  const latDistance = toRadians(latitudeB - latitudeA);
  const lonDistance = toRadians(longitudeB - longitudeA);

  const a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(toRadians(latitudeA)) *
      Math.cos(toRadians(latitudeB)) *
      Math.sin(lonDistance / 2) *
      Math.sin(lonDistance / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadiusKm * c;

  return Number(distance.toFixed(2));
};

export const formatDistance = (distance?: number | null): string | null => {
  if (distance === undefined || distance === null || Number.isNaN(distance)) {
    return null;
  }

  if (distance < 1) {
    return `${Math.round(distance * 1000)} m`;
  }

  return `${distance.toFixed(1)} km`;
};
