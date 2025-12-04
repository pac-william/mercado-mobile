import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePermissions } from '../../src/hooks/usePermissions';
import * as permissions from '../../src/utils/permissions';
import * as toast from '../../src/utils/toast';

jest.mock('../../src/utils/permissions');
jest.mock('../../src/utils/toast');
jest.mock('react-native', () => ({
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  },
  Alert: {
    alert: jest.fn(),
  },
}));

const mockPermissions = permissions as jest.Mocked<typeof permissions>;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('usePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPermissions.checkLocationPermission.mockResolvedValue({
      status: 'undetermined',
      granted: false,
    });
    mockPermissions.requestLocationPermission.mockResolvedValue({
      status: 'granted',
      granted: true,
    });
    mockPermissions.checkMediaPermissions.mockResolvedValue({
      camera: 'undetermined',
      mediaLibrary: 'undetermined',
      granted: false,
    });
    mockPermissions.requestCameraPermission.mockResolvedValue('granted');
    mockPermissions.requestMediaLibraryPermission.mockResolvedValue('granted');
    mockPermissions.requestMediaPermissions.mockResolvedValue({
      camera: 'granted',
      mediaLibrary: 'granted',
      granted: true,
    });
    mockPermissions.checkNotificationPermission.mockResolvedValue({
      status: 'undetermined',
      granted: false,
    });
    mockPermissions.requestNotificationPermission.mockResolvedValue({
      status: 'granted',
      granted: true,
    });
    mockPermissions.openSettings.mockResolvedValue(true);
  });

  describe('location', () => {
    it('deve verificar permissão de localização', async () => {
      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.location.check();
      });

      expect(mockPermissions.checkLocationPermission).toHaveBeenCalled();
    });

    it('deve solicitar permissão de localização', async () => {
      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        const granted = await result.current.location.request();
        expect(granted).toBe(true);
      });

      expect(mockPermissions.requestLocationPermission).toHaveBeenCalled();
    });

    it('deve mostrar toast de sucesso quando permissão concedida', async () => {
      mockPermissions.checkLocationPermission.mockResolvedValue({
        status: 'undetermined',
        granted: false,
      });
      mockPermissions.requestLocationPermission.mockResolvedValue({
        status: 'granted',
        granted: true,
      });

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.location.request();
      });

      expect(mockToast.showSuccessToast).toHaveBeenCalledWith('Permissão de localização concedida');
    });

    it('deve mostrar alerta quando permissão negada', async () => {
      mockPermissions.requestLocationPermission.mockResolvedValue({
        status: 'denied',
        granted: false,
      });

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.location.request();
      });

      expect(mockPermissions.showPermissionAlert).toHaveBeenCalled();
    });
  });

  describe('camera', () => {
    it('deve verificar permissão da câmera', async () => {
      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.camera.check();
      });

      expect(mockPermissions.checkMediaPermissions).toHaveBeenCalled();
    });

    it('deve solicitar permissão da câmera', async () => {
      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        const granted = await result.current.camera.request();
        expect(granted).toBe(true);
      });

      expect(mockPermissions.requestCameraPermission).toHaveBeenCalled();
    });
  });

  describe('mediaLibrary', () => {
    it('deve verificar permissão da galeria', async () => {
      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.mediaLibrary.check();
      });

      expect(mockPermissions.checkMediaPermissions).toHaveBeenCalled();
    });

    it('deve solicitar permissão da galeria', async () => {
      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        const granted = await result.current.mediaLibrary.request();
        expect(granted).toBe(true);
      });

      expect(mockPermissions.requestMediaLibraryPermission).toHaveBeenCalled();
    });
  });

  describe('media', () => {
    it('deve verificar permissões de mídia', async () => {
      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.media.check();
      });

      expect(mockPermissions.checkMediaPermissions).toHaveBeenCalled();
    });

    it('deve solicitar permissões de mídia', async () => {
      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        const granted = await result.current.media.request();
        expect(granted).toBe(true);
      });

      expect(mockPermissions.requestMediaPermissions).toHaveBeenCalled();
    });

    it('deve retornar granted apenas quando ambas permissões concedidas', async () => {
      mockPermissions.requestMediaPermissions.mockResolvedValue({
        camera: 'granted',
        mediaLibrary: 'denied',
        granted: false,
      });

      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        const granted = await result.current.media.request();
        expect(granted).toBe(false);
      });

      expect(result.current.media.granted).toBe(false);
    });
  });

  describe('notifications', () => {
    it('deve verificar permissão de notificações', async () => {
      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        await result.current.notifications.check();
      });

      expect(mockPermissions.checkNotificationPermission).toHaveBeenCalled();
    });

    it('deve solicitar permissão de notificações', async () => {
      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        const granted = await result.current.notifications.request();
        expect(granted).toBe(true);
      });

      expect(mockPermissions.requestNotificationPermission).toHaveBeenCalled();
    });
  });

  describe('openSettings', () => {
    it('deve abrir configurações', async () => {
      const { result } = renderHook(() => usePermissions());

      await act(async () => {
        const opened = await result.current.openSettings();
        expect(opened).toBe(true);
      });

      expect(mockPermissions.openSettings).toHaveBeenCalled();
    });
  });

  describe('showAlerts', () => {
    it('deve mostrar alerta de localização', () => {
      const { result } = renderHook(() => usePermissions());

      act(() => {
        result.current.showLocationAlert();
      });

      expect(mockPermissions.showPermissionAlert).toHaveBeenCalled();
    });

    it('deve mostrar alerta de câmera', () => {
      const { result } = renderHook(() => usePermissions());

      act(() => {
        result.current.showCameraAlert();
      });

      expect(mockPermissions.showPermissionAlert).toHaveBeenCalled();
    });

    it('deve mostrar alerta de galeria', () => {
      const { result } = renderHook(() => usePermissions());

      act(() => {
        result.current.showMediaLibraryAlert();
      });

      expect(mockPermissions.showPermissionAlert).toHaveBeenCalled();
    });

    it('deve mostrar alerta de notificações', () => {
      const { result } = renderHook(() => usePermissions());

      act(() => {
        result.current.showNotificationAlert();
      });

      expect(mockPermissions.showPermissionAlert).toHaveBeenCalled();
    });
  });
});

