import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MD3LightTheme, MD3DarkTheme, PaperProvider, useTheme as usePaperTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = '@mercado_mobile:theme';

// Tema claro customizado
const lightTheme = {
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
  },
};

// Tema escuro customizado
const darkTheme = {
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
  },
};

type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: typeof lightTheme | typeof darkTheme;
  isDark: boolean;
  toggleTheme: () => Promise<void>;
  setTheme: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

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
    } finally {
      setIsLoading(false);
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

  if (isLoading) {
    return null; // Ou um loading screen
  }

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

