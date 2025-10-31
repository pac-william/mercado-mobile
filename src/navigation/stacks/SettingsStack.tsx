import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { SettingsStackParamList } from '../types';
import { TabParamList } from '../types';
import { settingsStackRoutes, createStackRoutes } from '../config';

const Stack = createStackNavigator<SettingsStackParamList>();

export const SettingsStackNavigator: React.FC<
  BottomTabScreenProps<TabParamList, 'SettingsStack'>
> = () => {
  const routes = createStackRoutes(settingsStackRoutes);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {routes.map((route) => (
        <Stack.Screen
          key={route.key}
          name={route.name as keyof SettingsStackParamList}
          component={route.component}
          options={route.options}
        />
      ))}
    </Stack.Navigator>
  );
};

