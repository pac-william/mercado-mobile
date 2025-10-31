import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { TabParamList } from './types';
import { HomeStackNavigator } from './stacks/HomeStack';
import { SearchStackNavigator } from './stacks/SearchStack';
import { AIStackNavigator } from './stacks/AIStack';
import { SettingsStackNavigator } from './stacks/SettingsStack';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => {
  const paperTheme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 1,
          left: 15,
          right: 15,
          elevation: 5,
          backgroundColor: paperTheme.colors.surface,
          height: Platform.OS === 'ios' ? 70 : 50,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: 10 },
          shadowRadius: 10,
          borderRadius: 20,
        },
        tabBarIcon: ({ focused, size }) => {
          let iconName: string;
          let iconSize = size;

          if (route.name === 'HomeStack') {
            iconName = focused ? 'home' : 'home-outline';
            iconSize = focused ? 35 : 25;
          } else if (route.name === 'SearchStack') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'AIStack') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'SettingsStack') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'home-outline';
          }

          return (
            <Ionicons
              name={iconName as any}
              size={iconSize}
              color={focused ? paperTheme.colors.primary : paperTheme.colors.onSurfaceVariant}
            />
          );
        },
      })}
    >
      <Tab.Screen 
        name="HomeStack" 
        component={HomeStackNavigator}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            const focusedRouteName = getFocusedRouteNameFromRoute(route) ?? 'HomeMain';
            
            // Se não estamos na tela inicial do Home, navega para ela
            if (focusedRouteName !== 'HomeMain') {
              e.preventDefault();
              navigation.navigate('HomeStack', {
                screen: 'HomeMain',
              } as any);
            }
          },
        })}
      />
      <Tab.Screen 
        name="SearchStack" 
        component={SearchStackNavigator}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            const focusedRouteName = getFocusedRouteNameFromRoute(route) ?? 'SearchMain';
            
            // Se não estamos na tela inicial do Search, navega para ela
            if (focusedRouteName !== 'SearchMain') {
              e.preventDefault();
              navigation.navigate('SearchStack', {
                screen: 'SearchMain',
              } as any);
            }
          },
        })}
      />
      <Tab.Screen 
        name="AIStack" 
        component={AIStackNavigator}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            const focusedRouteName = getFocusedRouteNameFromRoute(route) ?? 'AIMain';
            
            // Se não estamos na tela inicial do AI, navega para ela
            if (focusedRouteName !== 'AIMain') {
              e.preventDefault();
              navigation.navigate('AIStack', {
                screen: 'AIMain',
              } as any);
            }
          },
        })}
      />
      <Tab.Screen 
        name="SettingsStack" 
        component={SettingsStackNavigator}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            const focusedRouteName = getFocusedRouteNameFromRoute(route) ?? 'SettingsMain';
            
            // Se não estamos na tela inicial do Settings, navega para ela
            if (focusedRouteName !== 'SettingsMain') {
              e.preventDefault();
              navigation.navigate('SettingsStack', {
                screen: 'SettingsMain',
              } as any);
            }
          },
        })}
      />
    </Tab.Navigator>
  );
};

