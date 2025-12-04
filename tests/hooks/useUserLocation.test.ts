import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useUserLocation } from '../../src/hooks/useUserLocation';
import { usePermissions } from '../../src/hooks/usePermissions';
import { useLoading } from '../../src/hooks/useLoading';
import * as Location from 'expo-location';

jest.mock('../../src/hooks/usePermissions');
jest.mock('../../src/hooks/useLoading');
jest.mock('expo-location');

const mockUsePermissions = usePermissions as jest.MockedFunction<typeof usePermissions>;
const mockUseLoading = useLoading as jest.MockedFunction<typeof useLoading>;
const mockLocation = Location as jest.Mocked<typeof Location>;

describe('useUserLocation', () => {
  const mockExecute = jest.fn((fn) => fn());
  const mockShowLocationAlert = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePermissions.mockReturnValue({
      location: {
        status: 'granted',
        granted: true,
        loading: false,
        check: jest.fn(),
        request: jest.fn().mockResolvedValue(true),
      },
      camera: {
        status: 'undetermined',
        granted: false,
        loading: false,
        check: jest.fn(),
        request: jest.fn(),
      },
      mediaLibrary: {
        status: 'undetermined',
        granted: false,
        loading: false,
        check: jest.fn(),
        request: jest.fn(),
      },
      media: {
        camera: 'undetermined',
        mediaLibrary: 'undetermined',
        granted: false,
        loading: false,
        check: jest.fn(),
        request: jest.fn(),
      },
      notifications: {
        status: 'undetermined',
        granted: false,
        loading: false,
        check: jest.fn(),
        request: jest.fn(),
      },
      openSettings: jest.fn(),
      showLocationAlert: mockShowLocationAlert,
      showCameraAlert: jest.fn(),
      showMediaLibraryAlert: jest.fn(),
      showNotificationAlert: jest.fn(),
    });
    mockUseLoading.mockReturnValue({
      loading: false,
      setLoading: jest.fn(),
      startLoading: jest.fn(),
      stopLoading: jest.fn(),
      withLoading: jest.fn(),
      execute: mockExecute,
    });
  });

  describe('getUserLocation', () => {
    it('deve retornar localização quando permissão concedida', async () => {
      const mockCoords = {
        latitude: -23.5505,
        longitude: -46.6333,
      };

      mockLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: mockCoords.latitude,
          longitude: mockCoords.longitude,
          altitude: null,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as any);

      const { result } = renderHook(() => useUserLocation());

      let location: { latitude: number; longitude: number } | null = null;

      await act(async () => {
        location = await result.current.getUserLocation();
      });

      expect(location).toEqual(mockCoords);
      expect(mockLocation.getCurrentPositionAsync).toHaveBeenCalledWith({
        accuracy: Location.Accuracy.Balanced,
      });
    });

    it('deve solicitar permissão quando não concedida', async () => {
      const mockRequest = jest.fn().mockResolvedValue(true);
      mockUsePermissions.mockReturnValue({
        location: {
          status: 'undetermined',
          granted: false,
          loading: false,
          check: jest.fn(),
          request: mockRequest,
        },
        camera: {
          status: 'undetermined',
          granted: false,
          loading: false,
          check: jest.fn(),
          request: jest.fn(),
        },
        mediaLibrary: {
          status: 'undetermined',
          granted: false,
          loading: false,
          check: jest.fn(),
          request: jest.fn(),
        },
        media: {
          camera: 'undetermined',
          mediaLibrary: 'undetermined',
          granted: false,
          loading: false,
          check: jest.fn(),
          request: jest.fn(),
        },
        notifications: {
          status: 'undetermined',
          granted: false,
          loading: false,
          check: jest.fn(),
          request: jest.fn(),
        },
        openSettings: jest.fn(),
        showLocationAlert: mockShowLocationAlert,
        showCameraAlert: jest.fn(),
        showMediaLibraryAlert: jest.fn(),
        showNotificationAlert: jest.fn(),
      });

      const mockCoords = {
        latitude: -23.5505,
        longitude: -46.6333,
      };

      mockLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: mockCoords.latitude,
          longitude: mockCoords.longitude,
          altitude: null,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as any);

      const { result } = renderHook(() => useUserLocation());

      await act(async () => {
        await result.current.getUserLocation();
      });

      expect(mockRequest).toHaveBeenCalled();
    });

    it('deve retornar null quando permissão negada', async () => {
      const mockRequest = jest.fn().mockResolvedValue(false);
      mockUsePermissions.mockReturnValue({
        location: {
          status: 'denied',
          granted: false,
          loading: false,
          check: jest.fn(),
          request: mockRequest,
        },
        camera: {
          status: 'undetermined',
          granted: false,
          loading: false,
          check: jest.fn(),
          request: jest.fn(),
        },
        mediaLibrary: {
          status: 'undetermined',
          granted: false,
          loading: false,
          check: jest.fn(),
          request: jest.fn(),
        },
        media: {
          camera: 'undetermined',
          mediaLibrary: 'undetermined',
          granted: false,
          loading: false,
          check: jest.fn(),
          request: jest.fn(),
        },
        notifications: {
          status: 'undetermined',
          granted: false,
          loading: false,
          check: jest.fn(),
          request: jest.fn(),
        },
        openSettings: jest.fn(),
        showLocationAlert: mockShowLocationAlert,
        showCameraAlert: jest.fn(),
        showMediaLibraryAlert: jest.fn(),
        showNotificationAlert: jest.fn(),
      });

      const { result } = renderHook(() => useUserLocation());

      let location: { latitude: number; longitude: number } | null = null;

      await act(async () => {
        location = await result.current.getUserLocation();
      });

      expect(location).toBeNull();
      expect(mockShowLocationAlert).toHaveBeenCalled();
    });

    it('deve retornar null quando erro ao obter localização', async () => {
      mockLocation.getCurrentPositionAsync.mockRejectedValue(new Error('Erro de GPS'));

      const { result } = renderHook(() => useUserLocation());

      let location: { latitude: number; longitude: number } | null = null;

      await act(async () => {
        location = await result.current.getUserLocation();
      });

      expect(location).toBeNull();
    });

    it('deve usar cache quando localização já obtida', async () => {
      const mockCoords = {
        latitude: -23.5505,
        longitude: -46.6333,
      };

      mockLocation.getCurrentPositionAsync.mockResolvedValue({
        coords: {
          latitude: mockCoords.latitude,
          longitude: mockCoords.longitude,
          altitude: null,
          accuracy: 10,
          altitudeAccuracy: null,
          heading: null,
          speed: null,
        },
        timestamp: Date.now(),
      } as any);

      const { result } = renderHook(() => useUserLocation());

      await act(async () => {
        await result.current.getUserLocation();
      });

      mockLocation.getCurrentPositionAsync.mockClear();

      let cachedLocation: { latitude: number; longitude: number } | null = null;

      await act(async () => {
        cachedLocation = await result.current.getUserLocation();
      });

      expect(cachedLocation).toEqual(mockCoords);
      expect(mockLocation.getCurrentPositionAsync).not.toHaveBeenCalled();
    });
  });

  describe('locationLoading', () => {
    it('deve retornar estado de loading', () => {
      mockUseLoading.mockReturnValue({
        loading: true,
        setLoading: jest.fn(),
        startLoading: jest.fn(),
        stopLoading: jest.fn(),
        withLoading: jest.fn(),
        execute: mockExecute,
      });

      const { result } = renderHook(() => useUserLocation());

      expect(result.current.locationLoading).toBe(true);
    });
  });
});

