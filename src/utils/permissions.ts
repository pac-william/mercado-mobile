import { Alert, Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined' | 'blocked';

export interface LocationPermissionResult {
  status: PermissionStatus;
  granted: boolean;
}

export interface MediaPermissionResult {
  camera: PermissionStatus;
  mediaLibrary: PermissionStatus;
  granted: boolean;
}

export interface NotificationPermissionResult {
  status: PermissionStatus;
  granted: boolean;
}

export const checkLocationPermission = async (): Promise<LocationPermissionResult> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    
    const permissionStatus: PermissionStatus = 
      status === 'granted' ? 'granted' :
      status === 'denied' ? 'denied' :
      status === 'undetermined' ? 'undetermined' : 'blocked';

    return {
      status: permissionStatus,
      granted: status === 'granted',
    };
  } catch (error: unknown) {
    return {
      status: 'undetermined',
      granted: false,
    };
  }
};

export const requestLocationPermission = async (): Promise<LocationPermissionResult> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    const permissionStatus: PermissionStatus = 
      status === 'granted' ? 'granted' :
      status === 'denied' ? 'denied' :
      status === 'undetermined' ? 'undetermined' : 'blocked';

    return {
      status: permissionStatus,
      granted: status === 'granted',
    };
  } catch (error: unknown) {
    return {
      status: 'undetermined',
      granted: false,
    };
  }
};

export const checkMediaPermissions = async (): Promise<MediaPermissionResult> => {
  try {
    const [cameraStatus, mediaLibraryStatus] = await Promise.all([
      ImagePicker.getCameraPermissionsAsync(),
      ImagePicker.getMediaLibraryPermissionsAsync(),
    ]);

    const cameraPermission: PermissionStatus = 
      cameraStatus.status === 'granted' ? 'granted' :
      cameraStatus.status === 'denied' ? 'denied' :
      cameraStatus.status === 'undetermined' ? 'undetermined' : 'blocked';

    const mediaLibraryPermission: PermissionStatus = 
      mediaLibraryStatus.status === 'granted' ? 'granted' :
      mediaLibraryStatus.status === 'denied' ? 'denied' :
      mediaLibraryStatus.status === 'undetermined' ? 'undetermined' : 'blocked';

    return {
      camera: cameraPermission,
      mediaLibrary: mediaLibraryPermission,
      granted: cameraStatus.status === 'granted' && mediaLibraryStatus.status === 'granted',
    };
  } catch (error: unknown) {
    return {
      camera: 'undetermined',
      mediaLibrary: 'undetermined',
      granted: false,
    };
  }
};

export const requestCameraPermission = async (): Promise<PermissionStatus> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    return status === 'granted' ? 'granted' :
           status === 'denied' ? 'denied' :
           status === 'undetermined' ? 'undetermined' : 'blocked';
  } catch (error: unknown) {
    return 'undetermined';
  }
};

export const requestMediaLibraryPermission = async (): Promise<PermissionStatus> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    return status === 'granted' ? 'granted' :
           status === 'denied' ? 'denied' :
           status === 'undetermined' ? 'undetermined' : 'blocked';
  } catch (error: unknown) {
    return 'undetermined';
  }
};

export const requestMediaPermissions = async (): Promise<MediaPermissionResult> => {
  try {
    const [cameraStatus, mediaLibraryStatus] = await Promise.all([
      requestCameraPermission(),
      requestMediaLibraryPermission(),
    ]);

    return {
      camera: cameraStatus,
      mediaLibrary: mediaLibraryStatus,
      granted: cameraStatus === 'granted' && mediaLibraryStatus === 'granted',
    };
  } catch (error: unknown) {
    return {
      camera: 'undetermined',
      mediaLibrary: 'undetermined',
      granted: false,
    };
  }
};

export const checkNotificationPermission = async (): Promise<NotificationPermissionResult> => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    
    const permissionStatus: PermissionStatus = 
      status === 'granted' ? 'granted' :
      status === 'denied' ? 'denied' :
      status === 'undetermined' ? 'undetermined' : 'blocked';

    return {
      status: permissionStatus,
      granted: status === 'granted',
    };
  } catch (error: unknown) {
    return {
      status: 'undetermined',
      granted: false,
    };
  }
};

export const requestNotificationPermission = async (): Promise<NotificationPermissionResult> => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    
    const permissionStatus: PermissionStatus = 
      status === 'granted' ? 'granted' :
      status === 'denied' ? 'denied' :
      status === 'undetermined' ? 'undetermined' : 'blocked';

    return {
      status: permissionStatus,
      granted: status === 'granted',
    };
  } catch (error: unknown) {
    return {
      status: 'undetermined',
      granted: false,
    };
  }
};

export const openSettings = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
      return true;
    } else {
      await Linking.openSettings();
      return true;
    }
  } catch (error: unknown) {
    return false;
  }
};

export const showPermissionAlert = (
  title: string,
  message: string,
  onOpenSettings?: () => void,
  showCancel: boolean = true
): void => {
  const buttons = [];
  
  if (showCancel) {
    buttons.push({
      text: 'Cancelar',
      style: 'cancel' as const,
    });
  }
  
  buttons.push({
    text: 'Abrir Configurações',
    onPress: async () => {
      if (onOpenSettings) {
        await onOpenSettings();
      } else {
        await openSettings();
      }
    },
  });
  
  Alert.alert(title, message, buttons);
};

export const getLocationPermissionMessage = (status?: PermissionStatus): string => {
  if (status === 'blocked') {
    return 'A permissão de localização foi bloqueada. Para usar esta funcionalidade, você precisa habilitar nas configurações do dispositivo.\n\nSem esta permissão, não será possível:\n• Encontrar mercados próximos automaticamente\n• Preencher endereços usando sua localização\n• Calcular distâncias até os mercados';
  }
  
  if (status === 'denied') {
    return 'A permissão de localização foi negada. Para usar esta funcionalidade, você precisa habilitar nas configurações do dispositivo.\n\nSem esta permissão, não será possível:\n• Encontrar mercados próximos automaticamente\n• Preencher endereços usando sua localização\n• Calcular distâncias até os mercados';
  }
  
  return 'Precisamos da sua localização para:\n• Encontrar mercados próximos automaticamente\n• Preencher endereços usando sua localização\n• Calcular distâncias até os mercados\n\nSua localização é usada apenas quando você solicita e não é compartilhada com terceiros.';
};

export const getCameraPermissionMessage = (status?: PermissionStatus): string => {
  if (status === 'blocked') {
    return 'A permissão da câmera foi bloqueada. Para usar esta funcionalidade, você precisa habilitar nas configurações do dispositivo.\n\nSem esta permissão, não será possível:\n• Tirar foto de perfil\n• Escanear códigos de barras de produtos';
  }
  
  if (status === 'denied') {
    return 'A permissão da câmera foi negada. Para usar esta funcionalidade, você precisa habilitar nas configurações do dispositivo.\n\nSem esta permissão, não será possível:\n• Tirar foto de perfil\n• Escanear códigos de barras de produtos';
  }
  
  return 'Precisamos da câmera para:\n• Tirar foto de perfil\n• Escanear códigos de barras de produtos\n\nA câmera é usada apenas quando você solicita e as fotos são armazenadas apenas no seu dispositivo.';
};

export const getMediaLibraryPermissionMessage = (status?: PermissionStatus): string => {
  if (status === 'blocked') {
    return 'A permissão da galeria foi bloqueada. Para usar esta funcionalidade, você precisa habilitar nas configurações do dispositivo.\n\nSem esta permissão, não será possível:\n• Escolher foto de perfil da galeria\n• Selecionar imagens de produtos';
  }
  
  if (status === 'denied') {
    return 'A permissão da galeria foi negada. Para usar esta funcionalidade, você precisa habilitar nas configurações do dispositivo.\n\nSem esta permissão, não será possível:\n• Escolher foto de perfil da galeria\n• Selecionar imagens de produtos';
  }
  
  return 'Precisamos acessar sua galeria para:\n• Escolher foto de perfil da galeria\n• Selecionar imagens de produtos\n\nApenas as fotos que você selecionar serão acessadas, e não compartilhamos suas imagens com terceiros.';
};

export const getNotificationPermissionMessage = (status?: PermissionStatus): string => {
  if (status === 'blocked') {
    return 'A permissão de notificações foi bloqueada. Para usar esta funcionalidade, você precisa habilitar nas configurações do dispositivo.\n\nSem esta permissão, não será possível:\n• Receber atualizações sobre seus pedidos\n• Ser notificado sobre promoções e ofertas\n• Receber lembretes de pedidos pendentes';
  }
  
  if (status === 'denied') {
    return 'A permissão de notificações foi negada. Para usar esta funcionalidade, você precisa habilitar nas configurações do dispositivo.\n\nSem esta permissão, não será possível:\n• Receber atualizações sobre seus pedidos\n• Ser notificado sobre promoções e ofertas\n• Receber lembretes de pedidos pendentes';
  }
  
  return 'Precisamos de permissão para enviar notificações sobre:\n• Atualizações dos seus pedidos\n• Promoções e ofertas especiais\n• Lembretes de pedidos pendentes\n\nVocê pode desativar as notificações a qualquer momento nas configurações do app.';
};

export const getLocationPermissionTitle = (status?: PermissionStatus): string => {
  if (status === 'blocked' || status === 'denied') {
    return 'Permissão de Localização Necessária';
  }
  return 'Permissão de Localização';
};

export const getCameraPermissionTitle = (status?: PermissionStatus): string => {
  if (status === 'blocked' || status === 'denied') {
    return 'Permissão da Câmera Necessária';
  }
  return 'Permissão da Câmera';
};

export const getMediaLibraryPermissionTitle = (status?: PermissionStatus): string => {
  if (status === 'blocked' || status === 'denied') {
    return 'Permissão da Galeria Necessária';
  }
  return 'Permissão da Galeria';
};

export const getNotificationPermissionTitle = (status?: PermissionStatus): string => {
  if (status === 'blocked' || status === 'denied') {
    return 'Permissão de Notificações Necessária';
  }
  return 'Permissão de Notificações';
};

