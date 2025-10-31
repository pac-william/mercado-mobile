import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';
import { useAuth } from '../contexts/AuthContext';
import { useOnboarding } from '../contexts/OnboardingContext';
import SplashScreen from '../views/splash/SplashScreen';
import OnboardingNavigator from '../views/onboarding/OnboardingNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { state: authState } = useAuth();
  const { state: onboardingState, completeOnboarding } = useOnboarding();

  if (authState.isLoading || onboardingState.isLoading) {
    return <SplashScreen />;
  }

  if (!onboardingState.hasCompletedOnboarding) {
    return <OnboardingNavigator onComplete={completeOnboarding} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

