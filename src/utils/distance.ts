const toRadians = (value: number): number => (value * Math.PI) / 180;

export const calculateDistanceInKm = (
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
): number => {
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

