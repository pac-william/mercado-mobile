import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  PermissionStatus,
  LocationPermissionResult,
  MediaPermissionResult,
  NotificationPermissionResult,
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
} from '../utils/permissions';
import { showSuccessToast, showErrorToast } from '../utils/toast';

interface UsePermissionsReturn {
  location: {
    status: PermissionStatus;
    granted: boolean;
    loading: boolean;
    check: () => Promise<void>;
    request: () => Promise<boolean>;
  };
  camera: {
    status: PermissionStatus;
    granted: boolean;
    loading: boolean;
    check: () => Promise<void>;
    request: () => Promise<boolean>;
  };
  mediaLibrary: {
    status: PermissionStatus;
    granted: boolean;
    loading: boolean;
    check: () => Promise<void>;
    request: () => Promise<boolean>;
  };
  media: {
    camera: PermissionStatus;
    mediaLibrary: PermissionStatus;
    granted: boolean;
    loading: boolean;
    check: () => Promise<void>;
    request: () => Promise<boolean>;
  };
  notifications: {
    status: PermissionStatus;
    granted: boolean;
    loading: boolean;
    check: () => Promise<void>;
    request: () => Promise<boolean>;
  };
  openSettings: () => Promise<boolean>;
  showLocationAlert: () => void;
  showCameraAlert: () => void;
  showMediaLibraryAlert: () => void;
  showNotificationAlert: () => void;
}

export const usePermissions = (): UsePermissionsReturn => {
  const [locationStatus, setLocationStatus] = useState<PermissionStatus>('undetermined');
  const [cameraStatus, setCameraStatus] = useState<PermissionStatus>('undetermined');
  const [mediaLibraryStatus, setMediaLibraryStatus] = useState<PermissionStatus>('undetermined');
  const [notificationStatus, setNotificationStatus] = useState<PermissionStatus>('undetermined');
  
  const [locationLoading, setLocationLoading] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [mediaLibraryLoading, setMediaLibraryLoading] = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const checkLocation = useCallback(async () => {
    const result = await checkLocationPermission();
    setLocationStatus(result.status);
  }, []);

  const requestLocation = useCallback(async (): Promise<boolean> => {
    setLocationLoading(true);
    try {
      const currentCheck = await checkLocationPermission();
      const wasGrantedBefore = currentCheck.granted;
      const previousStatus = currentCheck.status;
      
      const result = await requestLocationPermission();
      const statusChanged = previousStatus !== result.status;
      setLocationStatus(result.status);
      
      if (result.granted && statusChanged && !wasGrantedBefore) {
        showSuccessToast('Permissão de localização concedida');
      } else if (result.status === 'denied' || result.status === 'blocked') {
        showPermissionAlert(
          getLocationPermissionTitle(result.status),
          getLocationPermissionMessage(result.status),
          openSettings
        );
      }
      
      return result.granted;
    } catch (error) {
      showErrorToast('Erro ao solicitar permissão de localização');
      return false;
    } finally {
      setLocationLoading(false);
    }
  }, []);

  const checkCamera = useCallback(async () => {
    const mediaResult = await checkMediaPermissions();
    setCameraStatus(mediaResult.camera);
  }, []);

  const requestCamera = useCallback(async (): Promise<boolean> => {
    const previousStatus = cameraStatus;
    setCameraLoading(true);
    try {
      const status = await requestCameraPermission();
      setCameraStatus(status);
      
      if (status === 'granted' && previousStatus !== 'granted') {
        showSuccessToast('Permissão da câmera concedida');
      } else if (status !== 'granted') {
        showPermissionAlert(
          getCameraPermissionTitle(status),
          getCameraPermissionMessage(status),
          openSettings
        );
      }
      
      return status === 'granted';
    } catch (error) {
      showErrorToast('Erro ao solicitar permissão da câmera');
      return false;
    } finally {
      setCameraLoading(false);
    }
  }, [cameraStatus]);

  const checkMediaLibrary = useCallback(async () => {
    const mediaResult = await checkMediaPermissions();
    setMediaLibraryStatus(mediaResult.mediaLibrary);
  }, []);

  const requestMediaLibrary = useCallback(async (): Promise<boolean> => {
    const previousStatus = mediaLibraryStatus;
    setMediaLibraryLoading(true);
    try {
      const status = await requestMediaLibraryPermission();
      setMediaLibraryStatus(status);
      
      if (status === 'granted' && previousStatus !== 'granted') {
        showSuccessToast('Permissão da galeria concedida');
      } else if (status !== 'granted') {
        showPermissionAlert(
          getMediaLibraryPermissionTitle(status),
          getMediaLibraryPermissionMessage(status),
          openSettings
        );
      }
      
      return status === 'granted';
    } catch (error) {
      showErrorToast('Erro ao solicitar permissão da galeria');
      return false;
    } finally {
      setMediaLibraryLoading(false);
    }
  }, [mediaLibraryStatus]);

  const checkMedia = useCallback(async () => {
    const result = await checkMediaPermissions();
    setCameraStatus(result.camera);
    setMediaLibraryStatus(result.mediaLibrary);
  }, []);

  const requestMedia = useCallback(async (): Promise<boolean> => {
    const previousCameraStatus = cameraStatus;
    const previousMediaLibraryStatus = mediaLibraryStatus;
    const wasGranted = previousCameraStatus === 'granted' && previousMediaLibraryStatus === 'granted';
    
    setMediaLoading(true);
    try {
      const result = await requestMediaPermissions();
      setCameraStatus(result.camera);
      setMediaLibraryStatus(result.mediaLibrary);
      
      if (result.granted && !wasGranted) {
        showSuccessToast('Permissões de câmera e galeria concedidas');
      } else if (!result.granted) {
        if (result.camera !== 'granted' && result.mediaLibrary !== 'granted') {
          const cameraMessage = getCameraPermissionMessage(result.camera);
          const mediaLibraryMessage = getMediaLibraryPermissionMessage(result.mediaLibrary);
          showPermissionAlert(
            'Permissões Necessárias',
            `Precisamos de acesso à câmera e galeria para:\n• Escolher ou tirar foto de perfil\n• Selecionar imagens de produtos\n\n${cameraMessage}\n\n${mediaLibraryMessage}`,
            openSettings
          );
        } else if (result.camera !== 'granted') {
          showPermissionAlert(
            getCameraPermissionTitle(result.camera),
            getCameraPermissionMessage(result.camera),
            openSettings
          );
        } else if (result.mediaLibrary !== 'granted') {
          showPermissionAlert(
            getMediaLibraryPermissionTitle(result.mediaLibrary),
            getMediaLibraryPermissionMessage(result.mediaLibrary),
            openSettings
          );
        }
      }
      
      return result.granted;
    } catch (error) {
      showErrorToast('Erro ao solicitar permissões de mídia');
      return false;
    } finally {
      setMediaLoading(false);
    }
  }, [cameraStatus, mediaLibraryStatus]);

  const checkNotifications = useCallback(async () => {
    const result = await checkNotificationPermission();
    setNotificationStatus(result.status);
  }, []);

  const requestNotifications = useCallback(async (): Promise<boolean> => {
    const previousStatus = notificationStatus;
    setNotificationLoading(true);
    try {
      const result = await requestNotificationPermission();
      setNotificationStatus(result.status);
      
      if (result.granted && previousStatus !== 'granted') {
        showSuccessToast('Permissão de notificações concedida');
      } else if (result.status === 'denied' || result.status === 'blocked') {
        showPermissionAlert(
          getNotificationPermissionTitle(result.status),
          getNotificationPermissionMessage(result.status),
          openSettings
        );
      }
      
      return result.granted;
    } catch (error) {
      showErrorToast('Erro ao solicitar permissão de notificações');
      return false;
    } finally {
      setNotificationLoading(false);
    }
  }, [notificationStatus]);

  const handleOpenSettings = useCallback(async (): Promise<boolean> => {
    return await openSettings();
  }, []);

  const showLocationAlert = useCallback(() => {
    showPermissionAlert(
      getLocationPermissionTitle(locationStatus),
      getLocationPermissionMessage(locationStatus),
      openSettings
    );
  }, [locationStatus]);

  const showCameraAlert = useCallback(() => {
    showPermissionAlert(
      getCameraPermissionTitle(cameraStatus),
      getCameraPermissionMessage(cameraStatus),
      openSettings
    );
  }, [cameraStatus]);

  const showMediaLibraryAlert = useCallback(() => {
    showPermissionAlert(
      getMediaLibraryPermissionTitle(mediaLibraryStatus),
      getMediaLibraryPermissionMessage(mediaLibraryStatus),
      openSettings
    );
  }, [mediaLibraryStatus]);

  const showNotificationAlert = useCallback(() => {
    showPermissionAlert(
      getNotificationPermissionTitle(notificationStatus),
      getNotificationPermissionMessage(notificationStatus),
      openSettings
    );
  }, [notificationStatus]);

  useEffect(() => {
    checkLocation();
    checkMedia();
    checkNotifications();
  }, []);

  const appState = useRef(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        checkLocation();
        checkMedia();
        checkNotifications();
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return useMemo(() => ({
    location: {
      status: locationStatus,
      granted: locationStatus === 'granted',
      loading: locationLoading,
      check: checkLocation,
      request: requestLocation,
    },
    camera: {
      status: cameraStatus,
      granted: cameraStatus === 'granted',
      loading: cameraLoading,
      check: checkCamera,
      request: requestCamera,
    },
    mediaLibrary: {
      status: mediaLibraryStatus,
      granted: mediaLibraryStatus === 'granted',
      loading: mediaLibraryLoading,
      check: checkMediaLibrary,
      request: requestMediaLibrary,
    },
    media: {
      camera: cameraStatus,
      mediaLibrary: mediaLibraryStatus,
      granted: cameraStatus === 'granted' && mediaLibraryStatus === 'granted',
      loading: mediaLoading,
      check: checkMedia,
      request: requestMedia,
    },
    notifications: {
      status: notificationStatus,
      granted: notificationStatus === 'granted',
      loading: notificationLoading,
      check: checkNotifications,
      request: requestNotifications,
    },
    openSettings: handleOpenSettings,
    showLocationAlert,
    showCameraAlert,
    showMediaLibraryAlert,
    showNotificationAlert,
  }), [
    locationStatus,
    locationLoading,
    cameraStatus,
    cameraLoading,
    mediaLibraryStatus,
    mediaLibraryLoading,
    mediaLoading,
    notificationStatus,
    notificationLoading,
    checkLocation,
    requestLocation,
    checkCamera,
    requestCamera,
    checkMediaLibrary,
    requestMediaLibrary,
    checkMedia,
    requestMedia,
    checkNotifications,
    requestNotifications,
    handleOpenSettings,
    showLocationAlert,
    showCameraAlert,
    showMediaLibraryAlert,
    showNotificationAlert,
  ]);
};

