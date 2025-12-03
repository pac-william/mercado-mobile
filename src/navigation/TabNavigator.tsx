import React, { useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomTheme } from '../hooks/useCustomTheme';
import { TabParamList } from './types';
import { HomeStackNavigator } from './stacks/HomeStack';
import { AIStackNavigator } from './stacks/AIStack';
import { SettingsStackNavigator } from './stacks/SettingsStack';
import { getTabBarHeight, getTabBarPaddingBottom } from '../utils/tabBarUtils';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator: React.FC = () => {
  const paperTheme = useCustomTheme();
  const insets = useSafeAreaInsets();
  
  const tabBarHeight = getTabBarHeight(insets);
  const tabBarPaddingBottom = getTabBarPaddingBottom(insets);

  const tabBarIcon = useCallback(({ focused, route }: { focused: boolean; route: { name: string } }) => {
    let iconName: string;
    const iconSize = 28;

    if (route.name === 'HomeStack') {
      iconName = focused ? 'home' : 'home-outline';
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
  }, [paperTheme.colors.primary, paperTheme.colors.onSurfaceVariant]);

  const screenOptions = useCallback(({ route }: { route: { name: string } }) => ({
    headerShown: false,
    tabBarShowLabel: false,
    tabBarStyle: {
      position: 'absolute' as const,
      bottom: 0,
      left: 15,
      right: 15,
      elevation: 5,
      backgroundColor: paperTheme.colors.surface,
      height: tabBarHeight,
      paddingBottom: tabBarPaddingBottom,
      shadowColor: paperTheme.colors.modalShadow,
      shadowOpacity: 0.06,
      shadowOffset: { width: 0, height: 10 },
      shadowRadius: 10,
      borderRadius: 20,
    },
    tabBarIcon: ({ focused }: { focused: boolean }) => 
      tabBarIcon({ focused, route }),
  }), [paperTheme.colors.surface, paperTheme.colors.modalShadow, tabBarHeight, tabBarPaddingBottom, tabBarIcon]);

  return (
    <Tab.Navigator
      screenOptions={screenOptions}
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