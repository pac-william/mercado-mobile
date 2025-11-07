import { Alert, Platform } from 'react-native';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  title?: string;
  duration?: number;
  onPress?: () => void;
}

export const showToast = (
  message: string,
  type: ToastType = 'info',
  options?: ToastOptions
): void => {
  const title = options?.title || getDefaultTitle(type);
  
  if (Platform.OS === 'ios') {
    Alert.alert(title, message, [
      {
        text: 'OK',
        onPress: options?.onPress,
      },
    ]);
  } else {
    Alert.alert(title, message, [
      {
        text: 'OK',
        onPress: options?.onPress,
        style: 'default',
      },
    ]);
  }
};

const getDefaultTitle = (type: ToastType): string => {
  switch (type) {
    case 'success':
      return 'Sucesso';
    case 'error':
      return 'Erro';
    case 'warning':
      return 'Atenção';
    case 'info':
    default:
      return 'Informação';
  }
};

export const showSuccessToast = (message: string, options?: ToastOptions): void => {
  showToast(message, 'success', options);
};

export const showErrorToast = (message: string, options?: ToastOptions): void => {
  showToast(message, 'error', options);
};

export const showInfoToast = (message: string, options?: ToastOptions): void => {
  showToast(message, 'info', options);
};

export const showWarningToast = (message: string, options?: ToastOptions): void => {
  showToast(message, 'warning', options);
};

