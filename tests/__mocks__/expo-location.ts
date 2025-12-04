export enum Accuracy {
  Lowest = 1,
  Low = 2,
  Balanced = 3,
  High = 4,
  Highest = 5,
  BestForNavigation = 6,
}

export const getForegroundPermissionsAsync = jest.fn().mockResolvedValue({
  status: 'granted',
  granted: true,
  canAskAgain: true,
});

export const requestForegroundPermissionsAsync = jest.fn().mockResolvedValue({
  status: 'granted',
  granted: true,
  canAskAgain: true,
});

export const getCurrentPositionAsync = jest.fn().mockResolvedValue({
  coords: {
    latitude: -23.5505,
    longitude: -46.6333,
    altitude: null,
    accuracy: 10,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: Date.now(),
});

export const watchPositionAsync = jest.fn();
export const stopLocationUpdatesAsync = jest.fn();
export const hasServicesEnabledAsync = jest.fn().mockResolvedValue(true);

export default {
  Accuracy,
  getForegroundPermissionsAsync,
  requestForegroundPermissionsAsync,
  getCurrentPositionAsync,
  watchPositionAsync,
  stopLocationUpdatesAsync,
  hasServicesEnabledAsync,
};

