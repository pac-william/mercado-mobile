import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface OnboardingState {
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
}

interface OnboardingContextType {
  state: OnboardingState;
  completeOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_KEY = '@onboarding_completed';

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<OnboardingState>({
    hasCompletedOnboarding: false,
    isLoading: true,
  });

  const loadOnboardingStatus = useCallback(async () => {
    try {
      const savedStatus = await AsyncStorage.getItem(ONBOARDING_KEY);
      const hasCompleted = savedStatus === 'true';
      setState({
        hasCompletedOnboarding: hasCompleted,
        isLoading: false,
      });
    } catch (error) {
      console.error('Erro ao carregar status do onboarding:', error);
      setState({
        hasCompletedOnboarding: false,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    loadOnboardingStatus();
  }, [loadOnboardingStatus]);

  const completeOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      setState(prev => ({
        ...prev,
        hasCompletedOnboarding: true,
      }));
    } catch (error) {
      console.error('Erro ao salvar status do onboarding:', error);
    }
  }, []);

  return (
    <OnboardingContext.Provider value={{ state, completeOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  
  return context;
};