import { createNavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from './types';

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Navega para a tela de detalhes do pedido na aba de Configurações
 * a partir de qualquer lugar do app (inclusive de notificações em background).
 */
export function navigateToOrderDetail(orderId: string) {
  if (!navigationRef.isReady()) {
    console.warn('Navigation not ready to navigate to OrderDetail');
    return;
  }

  // Cast para any para permitir navegação entre stacks/tabs sem conflitos de tipo
  (navigationRef as any).navigate('MainTabs', {
    screen: 'SettingsStack',
    params: {
      screen: 'OrderDetail',
      params: { orderId },
    },
  });
}


