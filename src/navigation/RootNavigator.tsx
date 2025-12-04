import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { useOnboarding } from '../contexts/OnboardingContext';
import OnboardingNavigator from '../views/onboarding/OnboardingNavigator';
import SplashScreen from '../views/splash/SplashScreen';
import { TabNavigator } from './TabNavigator';
import { RootStackParamList } from './types';
import { navigationRef } from './navigationRef';

const Stack = createStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { state: onboardingState, completeOnboarding } = useOnboarding();

  if (onboardingState.isLoading) {
    return <SplashScreen />;
  }

  if (!onboardingState.hasCompletedOnboarding) {
    return <OnboardingNavigator onComplete={completeOnboarding} />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={TabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

