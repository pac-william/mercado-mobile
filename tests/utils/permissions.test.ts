import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { Linking, Alert, Platform } from 'react-native';
import {
  checkLocationPermission,
  requestLocationPermission,
  checkMediaPermissions,
  requestCameraPermission,
  requestMediaLibraryPermission,
  requestMediaPermissions,
  checkNotificationPermission,
  requestNotificationPermission,
  openSettings,
  showPermissionAlert,
  getLocationPermissionMessage,
  getCameraPermissionMessage,
  getMediaLibraryPermissionMessage,
  getNotificationPermissionMessage,
  getLocationPermissionTitle,
  getCameraPermissionTitle,
  getMediaLibraryPermissionTitle,
  getNotificationPermissionTitle,
} from '../../src/utils/permissions';

jest.mock('expo-location');
jest.mock('expo-image-picker');
jest.mock('expo-notifications');
jest.mock('react-native', () => ({
  Linking: {
    openURL: jest.fn(),
    openSettings: jest.fn(),
  },
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

const mockLocation = Location as jest.Mocked<typeof Location>;
const mockImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;
const mockLinking = Linking as jest.Mocked<typeof Linking>;

describe('permissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkLocationPermission', () => {
    it('deve retornar granted quando permissão concedida', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      const result = await checkLocationPermission();

      expect(result.status).toBe('granted');
      expect(result.granted).toBe(true);
    });

    it('deve retornar denied quando permissão negada', async () => {
      mockLocation.getForegroundPermissionsAsync.mockResolvedValue({
        status: 'denied',
        granted: false,
        canAskAgain: true,
        expires: 'never',
      } as any);

      const result = await checkLocationPermission();

      expect(result.status).toBe('denied');
      expect(result.granted).toBe(false);
    });

    it('deve retornar undetermined quando erro', async () => {
      mockLocation.getForegroundPermissionsAsync.mockRejectedValue(new Error('Erro'));

      const result = await checkLocationPermission();

      expect(result.status).toBe('undetermined');
      expect(result.granted).toBe(false);
    });
  });

  describe('requestLocationPermission', () => {
    it('deve solicitar permissão de localização', async () => {
      mockLocation.requestForegroundPermissionsAsync.mockResolvedValue({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      const result = await requestLocationPermission();

      expect(result.status).toBe('granted');
      expect(result.granted).toBe(true);
      expect(mockLocation.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });
  });

  describe('checkMediaPermissions', () => {
    it('deve retornar granted quando ambas permissões concedidas', async () => {
      mockImagePicker.getCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);
      mockImagePicker.getMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      const result = await checkMediaPermissions();

      expect(result.camera).toBe('granted');
      expect(result.mediaLibrary).toBe('granted');
      expect(result.granted).toBe(true);
    });

    it('deve retornar granted false quando uma permissão negada', async () => {
      mockImagePicker.getCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);
      mockImagePicker.getMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'denied',
        granted: false,
        canAskAgain: true,
        expires: 'never',
      } as any);

      const result = await checkMediaPermissions();

      expect(result.granted).toBe(false);
    });
  });

  describe('requestCameraPermission', () => {
    it('deve solicitar permissão da câmera', async () => {
      mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      const result = await requestCameraPermission();

      expect(result).toBe('granted');
      expect(mockImagePicker.requestCameraPermissionsAsync).toHaveBeenCalled();
    });
  });

  describe('requestMediaLibraryPermission', () => {
    it('deve solicitar permissão da galeria', async () => {
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      const result = await requestMediaLibraryPermission();

      expect(result).toBe('granted');
      expect(mockImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalled();
    });
  });

  describe('requestMediaPermissions', () => {
    it('deve solicitar ambas permissões de mídia', async () => {
      mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);
      mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      const result = await requestMediaPermissions();

      expect(result.camera).toBe('granted');
      expect(result.mediaLibrary).toBe('granted');
      expect(result.granted).toBe(true);
    });
  });

  describe('checkNotificationPermission', () => {
    it('deve retornar granted quando permissão concedida', async () => {
      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      const result = await checkNotificationPermission();

      expect(result.status).toBe('granted');
      expect(result.granted).toBe(true);
    });
  });

  describe('requestNotificationPermission', () => {
    it('deve solicitar permissão de notificações', async () => {
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      } as any);

      const result = await requestNotificationPermission();

      expect(result.status).toBe('granted');
      expect(result.granted).toBe(true);
      expect(mockNotifications.requestPermissionsAsync).toHaveBeenCalled();
    });
  });

  describe('openSettings', () => {
    it('deve abrir configurações no iOS', async () => {
      Platform.OS = 'ios';
      mockLinking.openURL.mockResolvedValue(true);

      const result = await openSettings();

      expect(result).toBe(true);
      expect(mockLinking.openURL).toHaveBeenCalledWith('app-settings:');
    });

    it('deve abrir configurações no Android', async () => {
      Platform.OS = 'android';
      mockLinking.openSettings.mockResolvedValue();

      const result = await openSettings();

      expect(result).toBe(true);
      expect(mockLinking.openSettings).toHaveBeenCalled();
    });

    it('deve retornar false quando erro', async () => {
      Platform.OS = 'ios';
      mockLinking.openURL.mockRejectedValue(new Error('Erro'));

      const result = await openSettings();

      expect(result).toBe(false);
    });
  });

  describe('showPermissionAlert', () => {
    it('deve mostrar alerta com botão de configurações', () => {
      const onOpenSettings = jest.fn();

      showPermissionAlert('Título', 'Mensagem', onOpenSettings);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Título',
        'Mensagem',
        expect.arrayContaining([
          expect.objectContaining({
            text: 'Abrir Configurações',
          }),
        ])
      );
    });

    it('deve incluir botão cancelar quando showCancel é true', () => {
      showPermissionAlert('Título', 'Mensagem', undefined, true);

      expect(Alert.alert).toHaveBeenCalledWith(
        'Título',
        'Mensagem',
        expect.arrayContaining([
          expect.objectContaining({
            text: 'Cancelar',
            style: 'cancel',
          }),
        ])
      );
    });
  });

  describe('getPermissionMessages', () => {
    it('deve retornar mensagem de localização bloqueada', () => {
      const message = getLocationPermissionMessage('blocked');
      expect(message).toContain('bloqueada');
      expect(message).toContain('configurações');
    });

    it('deve retornar mensagem de câmera negada', () => {
      const message = getCameraPermissionMessage('denied');
      expect(message).toContain('negada');
    });

    it('deve retornar mensagem padrão de galeria', () => {
      const message = getMediaLibraryPermissionMessage('undetermined');
      expect(message).toContain('galeria');
    });

    it('deve retornar mensagem de notificações', () => {
      const message = getNotificationPermissionMessage('granted');
      expect(message).toContain('notificações');
    });
  });

  describe('getPermissionTitles', () => {
    it('deve retornar título de localização necessária', () => {
      const title = getLocationPermissionTitle('blocked');
      expect(title).toBe('Permissão de Localização Necessária');
    });

    it('deve retornar título padrão de câmera', () => {
      const title = getCameraPermissionTitle();
      expect(title).toBe('Permissão da Câmera');
    });

    it('deve retornar título de galeria necessária', () => {
      const title = getMediaLibraryPermissionTitle('denied');
      expect(title).toBe('Permissão da Galeria Necessária');
    });

    it('deve retornar título de notificações', () => {
      const title = getNotificationPermissionTitle('granted');
      expect(title).toBe('Permissão de Notificações');
    });
  });
});

