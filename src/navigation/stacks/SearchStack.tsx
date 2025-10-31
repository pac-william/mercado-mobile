import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { SearchStackParamList } from '../types';
import { TabParamList } from '../types';
import { searchStackRoutes, createStackRoutes } from '../config';

const Stack = createStackNavigator<SearchStackParamList>();

export const SearchStackNavigator: React.FC<
  BottomTabScreenProps<TabParamList, 'SearchStack'>
> = () => {
  const routes = createStackRoutes(searchStackRoutes);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {routes.map((route) => (
        <Stack.Screen
          key={route.key}
          name={route.name as keyof SearchStackParamList}
          component={route.component}
          options={route.options}
        />
      ))}
    </Stack.Navigator>
  );
};

