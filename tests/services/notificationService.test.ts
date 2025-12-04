import { notificationService } from '../../src/services/notificationService';
import api from '../../src/services/api';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

jest.mock('../../src/services/api');
jest.mock('expo-notifications');
jest.mock('expo-secure-store');
jest.mock('@react-native-firebase/messaging', () => null);
jest.mock('../../src/navigation/navigationRef', () => ({
  navigateToOrderDetail: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockNotifications = Notifications as jest.Mocked<typeof Notifications>;
const mockSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('notificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    notificationService.reset();
    mockSecureStore.getItemAsync.mockResolvedValue(null);
    mockSecureStore.setItemAsync.mockResolvedValue();
  });

  describe('initialize', () => {
    it('deve inicializar serviço de notificações', async () => {
      mockNotifications.requestPermissionsAsync.mockResolvedValue({
        status: 'granted',
        granted: true,
      } as any);

      mockNotifications.getPermissionsAsync.mockResolvedValue({
        status: 'granted',
        granted: true,
      } as any);

      await notificationService.initialize();

      expect(mockNotifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
    });

    it('deve configurar notificações locais quando Firebase não disponível', async () => {
      await notificationService.initialize();

      expect(mockNotifications.setNotificationHandler).toHaveBeenCalled();
    });
  });

  describe('sendLocalNotification', () => {
    it('deve enviar notificação local', async () => {
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

      await notificationService.sendLocalNotification('Título', 'Mensagem', { key: 'value' });

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Título',
          body: 'Mensagem',
          data: { key: 'value' },
        },
        trigger: null,
      });
    });

    it('deve enviar notificação sem dados', async () => {
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

      await notificationService.sendLocalNotification('Título', 'Mensagem');

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Título',
          body: 'Mensagem',
          data: {},
        },
        trigger: null,
      });
    });
  });

  describe('scheduleLocalNotification', () => {
    it('deve agendar notificação com delay', async () => {
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

      const id = await notificationService.scheduleLocalNotification('Título', 'Mensagem', 60);

      expect(id).toBe('notification-id');
      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Título',
          body: 'Mensagem',
          data: {},
        },
        trigger: { seconds: 60 },
      });
    });

    it('deve enviar notificação imediata quando seconds é 0', async () => {
      mockNotifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

      await notificationService.scheduleLocalNotification('Título', 'Mensagem', 0);

      expect(mockNotifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: 'Título',
          body: 'Mensagem',
          data: {},
        },
        trigger: null,
      });
    });
  });

  describe('cancelNotification', () => {
    it('deve cancelar notificação agendada', async () => {
      mockNotifications.cancelScheduledNotificationAsync.mockResolvedValue();

      await notificationService.cancelNotification('notification-id');

      expect(mockNotifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('notification-id');
    });
  });

  describe('cancelAllNotifications', () => {
    it('deve cancelar todas as notificações', async () => {
      mockNotifications.cancelAllScheduledNotificationsAsync.mockResolvedValue();

      await notificationService.cancelAllNotifications();

      expect(mockNotifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });
  });

  describe('getNotifications', () => {
    it('deve retornar notificações com paginação', async () => {
      const mockResponse = {
        success: true,
        data: {
          notifications: [
            {
              id: '1',
              title: 'Notificação 1',
              body: 'Mensagem 1',
              createdAt: '2024-01-01T00:00:00Z',
              isRead: false,
              type: 'system',
            },
          ],
          pagination: {
            page: 1,
            size: 20,
            total: 1,
            totalPages: 1,
          },
        },
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await notificationService.getNotifications();

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications[0].title).toBe('Notificação 1');
      expect(result.pagination.total).toBe(1);
    });

    it('deve usar parâmetros de paginação', async () => {
      const mockResponse = {
        success: true,
        data: {
          notifications: [],
          pagination: {
            page: 2,
            size: 10,
            total: 0,
            totalPages: 0,
          },
        },
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      await notificationService.getNotifications({ page: 2, size: 10 });

      expect(mockApi.get).toHaveBeenCalledWith('/notifications?page=2&size=10');
    });

    it('deve filtrar por isRead', async () => {
      const mockResponse = {
        success: true,
        data: {
          notifications: [],
          pagination: {
            page: 1,
            size: 20,
            total: 0,
            totalPages: 0,
          },
        },
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      await notificationService.getNotifications({ isRead: false });

      expect(mockApi.get).toHaveBeenCalledWith('/notifications?isRead=false');
    });

    it('deve retornar array vazio quando API retorna 404', async () => {
      const error = { response: { status: 404 } };
      mockApi.get.mockRejectedValue(error);

      const result = await notificationService.getNotifications();

      expect(result.notifications).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });

    it('deve mapear tipo de notificação corretamente', async () => {
      const mockResponse = {
        success: true,
        data: {
          notifications: [
            {
              id: '1',
              title: 'Pedido',
              body: 'Seu pedido foi atualizado',
              createdAt: '2024-01-01T00:00:00Z',
              isRead: false,
              type: 'NEW_ORDER',
            },
          ],
          pagination: {
            page: 1,
            size: 20,
            total: 1,
            totalPages: 1,
          },
        },
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const result = await notificationService.getNotifications();

      expect(result.notifications[0].type).toBe('order');
    });
  });

  describe('getUnreadCount', () => {
    it('deve retornar contagem de não lidas', async () => {
      const mockResponse = {
        success: true,
        data: {
          count: 5,
        },
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const count = await notificationService.getUnreadCount();

      expect(count).toBe(5);
      expect(mockApi.get).toHaveBeenCalledWith('/notifications/unread/count');
    });

    it('deve retornar 0 quando API retorna 404', async () => {
      const error = { response: { status: 404 } };
      mockApi.get.mockRejectedValue(error);

      const count = await notificationService.getUnreadCount();

      expect(count).toBe(0);
    });

    it('deve retornar 0 quando resposta não tem count', async () => {
      const mockResponse = {
        success: true,
        data: {},
      };

      mockApi.get.mockResolvedValue({ data: mockResponse } as any);

      const count = await notificationService.getUnreadCount();

      expect(count).toBe(0);
    });
  });

  describe('markAsRead', () => {
    it('deve marcar notificação como lida', async () => {
      const mockResponse = {
        success: true,
      };

      mockApi.patch.mockResolvedValue({ data: mockResponse } as any);

      const result = await notificationService.markAsRead('notification-id');

      expect(result).toBe(true);
      expect(mockApi.patch).toHaveBeenCalledWith('/notifications/notification-id/read');
    });

    it('deve retornar false quando API retorna 404', async () => {
      const error = { response: { status: 404 } };
      mockApi.patch.mockRejectedValue(error);

      const result = await notificationService.markAsRead('notification-id');

      expect(result).toBe(false);
    });
  });

  describe('markAllAsRead', () => {
    it('deve marcar todas como lidas', async () => {
      const mockResponse = {
        success: true,
        data: {
          count: 3,
        },
      };

      mockApi.patch.mockResolvedValue({ data: mockResponse } as any);

      const count = await notificationService.markAllAsRead();

      expect(count).toBe(3);
      expect(mockApi.patch).toHaveBeenCalledWith('/notifications/read-all');
    });

    it('deve retornar 0 quando API retorna 404', async () => {
      const error = { response: { status: 404 } };
      mockApi.patch.mockRejectedValue(error);

      const count = await notificationService.markAllAsRead();

      expect(count).toBe(0);
    });
  });

  describe('deleteNotification', () => {
    it('deve deletar notificação', async () => {
      const mockResponse = {
        success: true,
      };

      mockApi.delete.mockResolvedValue({ data: mockResponse } as any);

      const result = await notificationService.deleteNotification('notification-id');

      expect(result).toBe(true);
      expect(mockApi.delete).toHaveBeenCalledWith('/notifications/notification-id');
    });

    it('deve retornar false quando API retorna 404', async () => {
      const error = { response: { status: 404 } };
      mockApi.delete.mockRejectedValue(error);

      const result = await notificationService.deleteNotification('notification-id');

      expect(result).toBe(false);
    });
  });

  describe('getToken', () => {
    it('deve retornar token FCM quando disponível', () => {
      const token = notificationService.getToken();
      expect(token).toBeNull();
    });
  });
});

