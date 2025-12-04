import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import api from './api';
import * as SecureStore from 'expo-secure-store';
import { navigateToOrderDetail } from '../navigation/navigationRef';

let messaging: any = null;
let isExpoGo = false;

try {
  messaging = require('@react-native-firebase/messaging').default;
  isExpoGo = Constants.executionEnvironment === 'storeClient';
} catch (error) {
  isExpoGo = true;
  console.log('Firebase não disponível - rodando no Expo Go ou módulo não instalado');
}

class NotificationService {
  private fcmToken: string | null = null;
  private isInitialized = false;
  private isFirebaseAvailable(): boolean {
    return !isExpoGo && messaging !== null;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    Notifications.addNotificationResponseReceivedListener((response) => {
      try {
        const data = response.notification.request.content.data as Record<string, any> | undefined;
        this.handleNotificationNavigation(data);
      } catch (error) {
        console.error('Erro ao processar clique na notificação (Expo):', error);
      }
    });

    if (!this.isFirebaseAvailable()) {
      console.log('Notificações Firebase desabilitadas - use um development build para ativar');
      this.setupLocalNotificationsOnly();
      this.isInitialized = true;
      return;
    }

    try {
      await this.requestPermission();
      await this.getFCMToken();
      this.setupNotificationHandlers();

      this.isInitialized = true;
    } catch (error) {
      console.error('Erro ao inicializar notificações:', error);
    }
  }

  private setupLocalNotificationsOnly(): void {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }

  private async requestPermission(): Promise<boolean> {
    if (!this.isFirebaseAvailable()) {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    }

    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        return enabled;
      } else {
        const authStatus = await messaging().requestPermission();
        return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificações:', error);
      return false;
    }
  }

  async getFCMToken(): Promise<string | null> {
    if (!this.isFirebaseAvailable()) {
      console.log('FCM não disponível no Expo Go');
      return null;
    }

    try {
      const token = await messaging().getToken();
      if (token) {
        this.fcmToken = token;
        await this.registerToken(token);
      }
      return token;
    } catch (error) {
      console.error('Erro ao obter token FCM:', error);
      return null;
    }
  }

  private async registerToken(token: string): Promise<void> {
    try {
      const deviceId = await this.getDeviceId();
      await api.post('/notifications/register', {
        token,
        deviceId,
        platform: Platform.OS,
      });
    } catch (error: any) {
      console.error('Erro ao registrar token:', error?.response?.data || error);
    }
  }

  async associateTokenToUser(userId: string): Promise<void> {
    if (!this.isFirebaseAvailable()) {
      console.log('Associação de token desabilitada no Expo Go');
      return;
    }

    try {
      if (!this.fcmToken) {
        await this.getFCMToken();
      }

      if (this.fcmToken) {
        const deviceId = await this.getDeviceId();
        await api.post('/notifications/associate-user', {
          token: this.fcmToken,
          userId,
          deviceId,
        });
      }
    } catch (error: any) {
      console.error('Erro ao associar token ao usuário:', error?.response?.data || error);
    }
  }

  async unregisterToken(): Promise<void> {
    if (!this.isFirebaseAvailable()) {
      return;
    }

    try {
      if (this.fcmToken) {
        await api.post('/notifications/unregister', {
          token: this.fcmToken,
        });
      }
    } catch (error: any) {
      console.error('Erro ao remover token:', error?.response?.data || error);
    } finally {
      this.fcmToken = null;
    }
  }

  private async getDeviceId(): Promise<string> {
    try {
      let deviceId = await SecureStore.getItemAsync('deviceId');
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await SecureStore.setItemAsync('deviceId', deviceId);
      }
      return deviceId;
    } catch (error) {
      return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }


  private setupNotificationHandlers(): void {
    if (!this.isFirebaseAvailable()) {
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    messaging().onMessage(async (remoteMessage: any) => {
      console.log('Notificação recebida com app aberto:', remoteMessage);
      if (remoteMessage.notification) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: remoteMessage.notification.title || 'Nova notificação',
            body: remoteMessage.notification.body || '',
            data: remoteMessage.data || {},
          },
          trigger: null,
        });
      }
    });

    messaging().onNotificationOpenedApp((remoteMessage: any) => {
      console.log('Notificação aberta com app em background:', remoteMessage);
      try {
        if (remoteMessage?.data) {
          this.handleNotificationNavigation(remoteMessage.data);
        }
      } catch (error) {
        console.error('Erro ao processar notificação em background:', error);
      }
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) {
          console.log('App aberto através de notificação:', remoteMessage);
          try {
            if (remoteMessage?.data) {
              this.handleNotificationNavigation(remoteMessage.data);
            }
          } catch (error) {
            console.error('Erro ao processar notificação inicial:', error);
          }
        }
      });
  }


  private handleNotificationNavigation(data?: Record<string, any>): void {
    try {
      if (!data) return;

      const type = (data.type || data.notificationType) as string | undefined;
      const orderId =
        (data.orderId as string | undefined) ||
        (data.order_id as string | undefined) ||
        (data.orderID as string | undefined);

      if (orderId && (type === 'NEW_ORDER' || type === 'ORDER_STATUS_UPDATE')) {
        navigateToOrderDetail(String(orderId));
      }
    } catch (error) {
      console.error('Erro ao navegar a partir da notificação:', error);
    }
  }

  getToken(): string | null {
    return this.fcmToken;
  }

  async sendLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Erro ao enviar notificação local:', error);
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    seconds: number,
    data?: Record<string, any>
  ): Promise<string> {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: seconds > 0 
          ? { seconds } as Notifications.TimeIntervalTriggerInput
          : null,
      });
      return notificationId;
    } catch (error) {
      console.error('Erro ao agendar notificação local:', error);
      throw error;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Erro ao cancelar notificação:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Erro ao cancelar todas as notificações:', error);
    }
  }
}

export const notificationService = new NotificationService();

