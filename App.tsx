import "react-native-gesture-handler";
import React from "react";
import { View, Text, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator, BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import Search from './src/views/search/Index';

import { Header } from './src/components/layout/header';
import Home from './src/views/home/Index';
import ProductDetail from './src/views/product/ProductDetail';
import CartScreen from './src/views/cart/CartScreen';
import { CartProvider } from './src/contexts/CartContext';


// Tipagem das telas
type HomeStackParamList = {
  HomeMain: undefined;
  ProductDetail: { product: any };
  Cart: undefined;
};

type SearchStackParamList = {
  SearchMain: undefined;
  ProductDetail: { product: any };
  Cart: undefined;
};

type SettingsStackParamList = {
  SettingsMain: undefined;
  ProductDetail: { product: any };
  Cart: undefined;
};

type TabParamList = {
  HomeStack: undefined;
  SearchStack: undefined;
  SettingsStack: undefined;
};

type RootStackParamList = {
  MainTabs: undefined;
};

// Stack Navigators
const HomeStack = createStackNavigator<HomeStackParamList>();
const SearchStack = createStackNavigator<SearchStackParamList>();
const SettingsStack = createStackNavigator<SettingsStackParamList>();

// Screens
const HomeScreen: React.FC<BottomTabScreenProps<TabParamList, 'HomeStack'>> = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={Home} />
      <HomeStack.Screen name="ProductDetail" component={ProductDetail} />
      <HomeStack.Screen name="Cart" component={CartScreen} />
    </HomeStack.Navigator>
  );
};

const SearchScreen: React.FC<BottomTabScreenProps<TabParamList, 'SearchStack'>> = () => {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="SearchMain" component={Search} />
      <SearchStack.Screen name="ProductDetail" component={ProductDetail} />
      <SearchStack.Screen name="Cart" component={CartScreen} />
    </SearchStack.Navigator>
  );
};

const SettingsScreen: React.FC<BottomTabScreenProps<TabParamList, 'SettingsStack'>> = () => {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain" component={() => (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Settings Screen</Text>
        </View>
      )} />
      <SettingsStack.Screen name="ProductDetail" component={ProductDetail} />
      <SettingsStack.Screen name="Cart" component={CartScreen} />
    </SettingsStack.Navigator>
  );
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

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
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = "";
          let iconSize = size;

          if (route.name === "HomeStack") {
            iconName = focused ? "home" : "home-outline";
            iconSize = focused ? 35 : 25;
          } else if (route.name === "SearchStack") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "SettingsStack") {
            iconName = focused ? "settings" : "settings-outline";
          }

          return <Ionicons name={iconName} size={iconSize} color={focused ? "#FF4500" : "gray"} />;
        },
      })}
    >
      <Tab.Screen name="HomeStack" component={HomeScreen} />
      <Tab.Screen name="SearchStack" component={SearchScreen} />
      <Tab.Screen name="SettingsStack" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const App: React.FC = () => {
  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
};

export default App;
