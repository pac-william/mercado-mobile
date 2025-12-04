export const requestPermissionsAsync = jest.fn().mockResolvedValue({
  status: 'granted',
  granted: true,
});

export const getPermissionsAsync = jest.fn().mockResolvedValue({
  status: 'granted',
  granted: true,
});

export const scheduleNotificationAsync = jest.fn().mockResolvedValue('notification-id');

export const cancelScheduledNotificationAsync = jest.fn().mockResolvedValue(undefined);

export const cancelAllScheduledNotificationsAsync = jest.fn().mockResolvedValue(undefined);

export const getAllScheduledNotificationsAsync = jest.fn().mockResolvedValue([]);

export const setNotificationHandler = jest.fn();

export const getExpoPushTokenAsync = jest.fn().mockResolvedValue({
  data: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
  type: 'expo',
});

export const addNotificationResponseReceivedListener = jest.fn(() => ({
  remove: jest.fn(),
}));

export default {
  requestPermissionsAsync,
  getPermissionsAsync,
  scheduleNotificationAsync,
  cancelScheduledNotificationAsync,
  cancelAllScheduledNotificationsAsync,
  getAllScheduledNotificationsAsync,
  setNotificationHandler,
  getExpoPushTokenAsync,
  addNotificationResponseReceivedListener,
};

