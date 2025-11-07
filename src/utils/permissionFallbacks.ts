import { PermissionStatus } from './permissions';

export interface PermissionFallback {
  isCritical: boolean;
  fallbackMessage?: string;
  fallbackAction?: () => void;
}

export const getLocationFallback = (status: PermissionStatus): PermissionFallback => {
  return {
    isCritical: false,
    fallbackMessage: 'Você pode adicionar um endereço manualmente.',
    fallbackAction: undefined,
  };
};

export const getCameraFallback = (status: PermissionStatus): PermissionFallback => {
  return {
    isCritical: false,
    fallbackMessage: 'Você pode continuar sem foto de perfil ou escolher uma foto da galeria.',
    fallbackAction: undefined,
  };
};

export const getMediaLibraryFallback = (status: PermissionStatus): PermissionFallback => {
  return {
    isCritical: false,
    fallbackMessage: 'Você pode continuar sem foto de perfil ou tirar uma foto com a câmera.',
    fallbackAction: undefined,
  };
};

export const getNotificationFallback = (status: PermissionStatus): PermissionFallback => {
  return {
    isCritical: false,
    fallbackMessage: 'O app continuará funcionando normalmente, mas você não receberá notificações.',
    fallbackAction: undefined,
  };
};

export const shouldBlockApp = (fallback: PermissionFallback): boolean => {
  return fallback.isCritical;
};

