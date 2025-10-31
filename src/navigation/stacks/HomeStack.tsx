import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { HomeStackParamList } from '../types';
import { TabParamList } from '../types';
import { homeStackRoutes, createStackRoutes } from '../config';

const Stack = createStackNavigator<HomeStackParamList>();

export const HomeStackNavigator: React.FC<
  BottomTabScreenProps<TabParamList, 'HomeStack'>
> = () => {
  const routes = createStackRoutes(homeStackRoutes);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {routes.map((route) => (
        <Stack.Screen
          key={route.key}
          name={route.name as keyof HomeStackParamList}
          component={route.component}
          options={route.options}
        />
      ))}
    </Stack.Navigator>
  );
};

