import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MD3LightTheme, MD3DarkTheme, PaperProvider, useTheme as usePaperTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CustomMD3Theme } from '../types/theme';

const THEME_KEY = '@mercado_mobile:theme';

// Tema claro customizado
const lightTheme: CustomMD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2E7D32',
    secondary: '#FF4500',
    tertiary: '#0891B2',
    background: '#f8f9fa',
    surface: '#ffffff',
    surfaceVariant: '#f5f5f5',
    error: '#d32f2f',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onSurface: '#1a1a1a',
    onBackground: '#1a1a1a',
    outline: '#e0e0e0',
    surfaceLight: '#f0f0f0',
    outlineLight: '#e0e0e0',
    accent: '#EA1D2C',
    errorBackground: '#ffebee',
    errorText: '#d32f2f',
    white: '#FFFFFF',
    successIcon: '#4CAF50',
    successBackground: '#E8F5E8',
    warningIcon: '#FF9800',
    warningBackground: '#FFF3E0',
    infoIcon: '#2196F3',
    infoBackground: '#E3F2FD',
    modalOverlay: 'rgba(0, 0, 0, 0.5)',
    modalShadow: '#000',
    modalSurface: '#ffffff',
    textSecondary: '#666',
    buttonPrimary: '#2E7D32',
    buttonDanger: '#F44336',
    buttonSuccess: '#4CAF50',
    statusPending: '#FF9800',
    statusConfirmed: '#2196F3',
    statusPreparing: '#9C27B0',
    statusOutForDelivery: '#FF5722',
    statusDelivered: '#4CAF50',
    statusCancelled: '#F44336',
    statusDefault: '#757575',
    textShadow: 'rgba(0, 0, 0, 0.5)',
    discountBadge: '#FF6B6B',
    favoriteIcon: '#FFD700',
    favoriteText: '#8b6914',
    borderLight: 'rgba(0,0,0,0.1)',
    overlayLight: 'rgba(255,255,255,0.5)',
  },
};

// Tema escuro customizado
const darkTheme: CustomMD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#4CAF50',
    secondary: '#FF6B35',
    tertiary: '#22D3EE',
    background: '#121212',
    surface: '#1e1e1e',
    surfaceVariant: '#2a2a2a',
    error: '#ef5350',
    onPrimary: '#ffffff',
    onSecondary: '#ffffff',
    onSurface: '#ffffff',
    onBackground: '#ffffff',
    outline: '#424242',
    surfaceLight: '#2a2a2a',
    outlineLight: '#424242',
    accent: '#FF5252',
    errorBackground: '#3d1f1f',
    errorText: '#ef5350',
    white: '#FFFFFF',
    successIcon: '#66BB6A',
    successBackground: '#1B5E20',
    warningIcon: '#FFB74D',
    warningBackground: '#E65100',
    infoIcon: '#64B5F6',
    infoBackground: '#0D47A1',
    modalOverlay: 'rgba(0, 0, 0, 0.7)',
    modalShadow: '#000',
    modalSurface: '#1e1e1e',
    textSecondary: '#B0B0B0',
    buttonPrimary: '#4CAF50',
    buttonDanger: '#EF5350',
    buttonSuccess: '#66BB6A',
    statusPending: '#FFB74D',
    statusConfirmed: '#64B5F6',
    statusPreparing: '#BA68C8',
    statusOutForDelivery: '#FF8A65',
    statusDelivered: '#66BB6A',
    statusCancelled: '#EF5350',
    statusDefault: '#9E9E9E',
    textShadow: 'rgba(0, 0, 0, 0.7)',
    discountBadge: '#FF5252',
    favoriteIcon: '#FFB74D',
    favoriteText: '#E65100',
    borderLight: 'rgba(255,255,255,0.1)',
    overlayLight: 'rgba(255,255,255,0.3)',
  },
};

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: CustomMD3Theme;
  isDark: boolean;
  toggleTheme: () => Promise<void>;
  setTheme: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setThemeMode(savedTheme);
      }
    } catch (error) {
      console.error('Erro ao carregar tema:', error);
    }
  };

  const saveTheme = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const setTheme = async (mode: ThemeMode) => {
    setThemeMode(mode);
    await saveTheme(mode);
  };

  const toggleTheme = async () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    await setTheme(newMode);
  };

  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isDark = themeMode === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      <PaperProvider theme={theme}>
        {children}
      </PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};