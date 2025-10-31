import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { AIStackParamList } from '../types';
import { TabParamList } from '../types';
import { aiStackRoutes, createStackRoutes } from '../config';

const Stack = createStackNavigator<AIStackParamList>();

export const AIStackNavigator: React.FC<
  BottomTabScreenProps<TabParamList, 'AIStack'>
> = () => {
  const routes = createStackRoutes(aiStackRoutes);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {routes.map((route) => (
        <Stack.Screen
          key={route.key}
          name={route.name as keyof AIStackParamList}
          component={route.component}
          options={route.options}
        />
      ))}
    </Stack.Navigator>
  );
};

