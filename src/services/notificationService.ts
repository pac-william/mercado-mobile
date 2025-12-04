import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import api from './api';
import * as SecureStore from 'expo-secure-store';
import { navigateToOrderDetail } from '../navigation/navigationRef';


export interface Notification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  type: 'order' | 'system';
  data?: Record<string, any>;
}



let messaging: any = null;
let isExpoGo = false;

try {
  messaging = require('@react-native-firebase/messaging').default;
  isExpoGo = Constants.executionEnvironment === 'storeClient';
} catch (error) {
  isExpoGo = true;
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
        //
      }
    });

    if (!this.isFirebaseAvailable()) {
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
      this.isInitialized = false;
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
      this.fcmToken = null;
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
      return;
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
      return;
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    seconds: number,
    data?: Record<string, any>
  ): Promise<string|void> {
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
        return;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      return;
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      return;
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
      if (error?.response?.status === 404) {
        console.warn('Rota de notificações não encontrada no backend (404)');
        return {
          notifications: [],
          pagination: {
            page: 1,
            size: 20,
            total: 0,
            totalPages: 0,
          },
        };
      }
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
      if (error?.response?.status === 404) {
        console.warn('Rota de contagem de notificações não encontrada no backend (404)');
        return 0;
      }
      console.error('Erro ao contar notificações não lidas:', error?.response?.data || error?.message);
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response.data?.success || false;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.warn('Rota de marcar notificação como lida não encontrada no backend (404)');
        return false;
      }
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
      if (error?.response?.status === 404) {
        console.warn('Rota de marcar todas como lidas não encontrada no backend (404)');
        return 0;
      }
      console.error('Erro ao marcar todas as notificações como lidas:', error?.response?.data || error?.message);
      return 0;
    }
  }

  async deleteNotification(notificationId: string): Promise<boolean> {
    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      return response.data?.success || false;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        console.warn('Rota de deletar notificação não encontrada no backend (404)');
        return false;
      }
      console.error('Erro ao deletar notificação:', error?.response?.data || error?.message);
      return false;
    }
  }

  private mapNotificationType(type: string | undefined): 'order' | 'system' {
    if (!type) return 'system';
    const normalized = String(type).toUpperCase();
    if (
      normalized === 'NEW_ORDER' ||
      normalized === 'ORDER_STATUS_UPDATE' ||
      normalized === 'ORDER_UPDATE' ||
      normalized === 'ORDER_DELIVERED'
    ) {
      return 'order';
    }
    return 'system';
  }
}

export const notificationService = new NotificationService();