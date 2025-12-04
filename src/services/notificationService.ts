import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import api from './api';
import * as SecureStore from 'expo-secure-store';

let messaging: any = null;
let isExpoGo = false;

try {
  const firebase = require('@react-native-firebase/app');
  firebase.getApp();
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

    this.setupLocalNotificationsOnly();

    const hasPermission = await this.requestPermission();
    
    if (!hasPermission) {
      console.log('Permissão de notificações negada');
      this.isInitialized = true;
      return;
    }

    if (this.isFirebaseAvailable()) {
      try {
        await this.getFCMToken();
        this.setupNotificationHandlers();
      } catch (error) {
        console.error('Erro ao configurar Firebase:', error);
      }
    }

    this.isInitialized = true;
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

  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });

      const granted = status === 'granted';

      if (this.isFirebaseAvailable() && granted) {
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
          console.error('Erro ao solicitar permissão do Firebase:', error);
          return granted;
        }
      }

      return granted;
    } catch (error) {
      console.error('Erro ao solicitar permissão de notificações:', error);
      return false;
    }
  }

  async getFCMToken(): Promise<string | null> {
    if (!this.isFirebaseAvailable()) {
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
        fcmToken: token,
        deviceId:deviceId,
        platform: Platform.OS,
      });


    } catch (error: any) {
      console.error('Erro ao registrar token:', error?.response?.data || error?.message);
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
        await api.post('/notifications/associate-user', {
          fcmToken: this.fcmToken,
          userId,
        });
        
      }
    } catch (error: any) {
      console.error('Erro ao associar token ao usuário:', error?.response?.data || error?.message);
    }
  }

  async unregisterToken(): Promise<void> {
    if (!this.isFirebaseAvailable()) {
      return;
    }

    try {
      if (this.fcmToken) {
        await api.post('/notifications/unregister', {
          fcmToken: this.fcmToken,
        });
      }
    } catch (error: any) {
      console.error('Erro ao remover token:', error?.response?.data || error?.message);
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
    });

    messaging()
      .getInitialNotification()
      .then((remoteMessage: any) => {
        if (remoteMessage) {
          console.log('App aberto através de notificação:', remoteMessage);
        }
      });
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

  async getNotifications(params?: {
    page?: number;
    size?: number;
    isRead?: boolean;
  }): Promise<{
    notifications: Notification[];
    pagination: {
      page: number;
      size: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.size) queryParams.append('size', params.size.toString());
      if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());

      const response = await api.get(`/notifications?${queryParams.toString()}`);
      
      if (response.data?.success && response.data?.data) {
        return {
          notifications: response.data.data.notifications
            .filter((n: any) => n && n.id)
            .map((n: any) => {
              let notificationTime: Date;
              if (n.createdAt) {
                notificationTime = new Date(n.createdAt);
                if (isNaN(notificationTime.getTime())) {
                  notificationTime = new Date();
                }
              } else {
                notificationTime = new Date();
              }

              return {
                id: n.id,
                title: n.title || 'Notificação',
                message: n.body || '',
                time: notificationTime,
                read: n.isRead || false,
                type: this.mapNotificationType(n.type || 'system'),
                data: n.data,
              };
            }),
          pagination: response.data.data.pagination,
        };
      }
      
      throw new Error('Resposta inválida da API');
    } catch (error: any) {
      console.error('Erro ao buscar notificações:', error?.response?.data || error?.message);
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get('/notifications/unread/count');
      
      if (response.data?.success && response.data?.data) {
        return response.data.data.count || 0;
      }
      
      return 0;
    } catch (error: any) {
      console.error('Erro ao contar notificações não lidas:', error?.response?.data || error?.message);
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response.data?.success || false;
    } catch (error: any) {
      console.error('Erro ao marcar notificação como lida:', error?.response?.data || error?.message);
      return false;
    }
  }

  async markAllAsRead(): Promise<number> {
    try {
      const response = await api.patch('/notifications/read-all');
      if (response.data?.success && response.data?.data) {
        return response.data.data.count || 0;
      }
      return 0;
    } catch (error: any) {
      console.error('Erro ao marcar todas as notificações como lidas:', error?.response?.data || error?.message);
      return 0;
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data?.success || false;
    } catch (error: any) {
      console.error('Erro ao deletar notificação:', error?.response?.data || error?.message);
      return false;
    }
  }

  private mapNotificationType(type: string): 'order' | 'system' {
    if (type === 'NEW_ORDER' || type === 'ORDER_UPDATE' || type === 'ORDER_DELIVERED') {
      return 'order';
    }
    return 'system';
  }
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  type: 'order' | 'system';
  data?: Record<string, any>;
}

export const notificationService = new NotificationService();