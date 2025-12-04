import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../../src/contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  describe('useTheme', () => {
    it('deve retornar tema claro por padrão', async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isDark).toBe(false);
        expect(result.current.theme.colors.background).toBe('#f8f9fa');
      });
    });

    it('deve carregar tema salvo do AsyncStorage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('dark');

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isDark).toBe(true);
        expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@mercado_mobile:theme');
      });
    });

    it('deve alternar entre tema claro e escuro', async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isDark).toBe(false);
      });

      await act(async () => {
        await result.current.toggleTheme();
      });

      await waitFor(() => {
        expect(result.current.isDark).toBe(true);
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@mercado_mobile:theme', 'dark');
      });
    });

    it('deve definir tema específico', async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await act(async () => {
        await result.current.setTheme('dark');
      });

      await waitFor(() => {
        expect(result.current.isDark).toBe(true);
        expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@mercado_mobile:theme', 'dark');
      });
    });

    it('deve salvar tema no AsyncStorage ao alterar', async () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      await act(async () => {
        await result.current.setTheme('light');
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@mercado_mobile:theme', 'light');
    });

    it('deve retornar tema escuro quando definido', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('dark');

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isDark).toBe(true);
        expect(result.current.theme.colors.background).toBe('#121212');
      });
    });

    it('deve manter tema claro quando valor inválido no storage', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('invalid');

      const { result } = renderHook(() => useTheme(), { wrapper });

      await waitFor(() => {
        expect(result.current.isDark).toBe(false);
      });
    });
  });

  describe('ThemeProvider', () => {
    it('deve fornecer contexto de tema', () => {
      const { result } = renderHook(() => useTheme(), { wrapper });

      expect(result.current).toHaveProperty('theme');
      expect(result.current).toHaveProperty('isDark');
      expect(result.current).toHaveProperty('toggleTheme');
      expect(result.current).toHaveProperty('setTheme');
    });
  });
});

