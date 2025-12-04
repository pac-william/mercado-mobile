export const Platform = {
  OS: 'ios',
  Version: 15,
  select: jest.fn((obj: any) => obj.ios || obj.default),
};

export const Linking = {
  openURL: jest.fn().mockResolvedValue(true),
  openSettings: jest.fn().mockResolvedValue(true),
  canOpenURL: jest.fn().mockResolvedValue(true),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  getInitialURL: jest.fn().mockResolvedValue(null),
};

export const Alert = {
  alert: jest.fn(),
  prompt: jest.fn(),
};

export const AppState = {
  currentState: 'active',
  addEventListener: jest.fn(() => ({
    remove: jest.fn(),
  })),
  removeEventListener: jest.fn(),
};

export default {
  Platform,
  Linking,
  Alert,
  AppState,
};

