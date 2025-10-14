import "react-native-gesture-handler";
import React from "react";
import { View, Text, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator, BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import Search from './src/views/search/index';

import Home from './src/views/home/index';
import ProductDetail from './src/views/product/ProductDetail';
import MarketDetailsScreen from './src/views/market/index';
import CartScreen from './src/views/cart/CartScreen';
import LoginScreen from './src/views/auth/LoginScreen';
import RegisterScreen from './src/views/auth/RegisterScreen';
import SettingsScreen from './src/views/settings/SettingsScreen';
import { CartProvider } from './src/contexts/CartContext';
import { AuthProvider } from './src/contexts/AuthContext';


// Exporte os tipos para que possam ser importados em outros arquivos
export type HomeStackParamList = {
  HomeMain: undefined;
  ProductDetail: { product: any };
  Cart: undefined;
  MarketDetails: { marketId: string };
  Login: undefined;
  Register: undefined;
};

export type SearchStackParamList = {
  SearchMain: undefined;
  ProductDetail: { product: any };
  Cart: undefined;
  MarketDetails: { marketId: string };
  Login: undefined;
  Register: undefined;
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  ProductDetail: { product: any };
  Cart: undefined;
  Login: undefined;
  Register: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

type TabParamList = {
  HomeStack: undefined;
  SearchStack: undefined;
  SettingsStack: undefined;
};

type RootStackParamList = {
  MainTabs: undefined;
};

const HomeStack = createStackNavigator<HomeStackParamList>();
const SearchStack = createStackNavigator<SearchStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const HomeScreen: React.FC<BottomTabScreenProps<TabParamList, 'HomeStack'>> = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={Home} />
      <HomeStack.Screen name="ProductDetail" component={ProductDetail} />
      <HomeStack.Screen name="Cart" component={CartScreen} />
      <HomeStack.Screen name="MarketDetails" component={MarketDetailsScreen} />
      <HomeStack.Screen name="Login" component={LoginScreen} />
      <HomeStack.Screen name="Register" component={RegisterScreen} />
    </HomeStack.Navigator>
  );
};

const SearchScreen: React.FC<BottomTabScreenProps<TabParamList, 'SearchStack'>> = () => {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="SearchMain" component={Search} />
      <SearchStack.Screen name="ProductDetail" component={ProductDetail} />
      <SearchStack.Screen name="Cart" component={CartScreen} />
      <SearchStack.Screen name="MarketDetails" component={MarketDetailsScreen} />
      <SearchStack.Screen name="Login" component={LoginScreen} />
      <SearchStack.Screen name="Register" component={RegisterScreen} />
    </SearchStack.Navigator>
  );
};

const SettingsStackScreen: React.FC<BottomTabScreenProps<TabParamList, 'SettingsStack'>> = () => {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
      <SettingsStack.Screen name="ProductDetail" component={ProductDetail} />
      <SettingsStack.Screen name="Cart" component={CartScreen} />
      <SettingsStack.Screen name="Login" component={LoginScreen} />
      <SettingsStack.Screen name="Register" component={RegisterScreen} />
    </SettingsStack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: 1,
          left: 15,
          right: 15,
          elevation: 5,
          backgroundColor: "#fff",
          height: Platform.OS === "ios" ? 70 : 50,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: 10 },
          shadowRadius: 10,
        },
        tabBarIcon: ({ focused, size }) => {
            let iconName: string;
            let iconSize = size;

            if (route.name === "HomeStack") {
                iconName = focused ? "home" : "home-outline";
                iconSize = focused ? 35 : 25;
            } else if (route.name === "SearchStack") {
                iconName = focused ? "search" : "search-outline";
            } else if (route.name === "SettingsStack") {
                iconName = focused ? "settings" : "settings-outline";
            } else {
                iconName = "home-outline";
            }

            return <Ionicons name={iconName as any} size={iconSize} color={focused ? "#FF4500" : "gray"} />;
        },
      })}
    >
      <Tab.Screen name="HomeStack" component={HomeScreen} />
      <Tab.Screen name="SearchStack" component={SearchScreen} />
      <Tab.Screen name="SettingsStack" component={SettingsStackScreen} />
    </Tab.Navigator>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;