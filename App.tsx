import "react-native-gesture-handler";
import React from "react";
import { View, Text, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator, BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import Ionicons from "react-native-vector-icons/Ionicons";
import Search from './src/views/search/Index';

import { Header } from './src/components/layout/header';
import Home from './src/views/home/Index';

// Tipagem das telas
type TabParamList = {
  Profile: undefined;
  Home: undefined;
  Settings: undefined;
};

// Screens
const HomeScreen: React.FC<BottomTabScreenProps<TabParamList, 'Home'>> = () => {
  return (
    
    <View style={{ flex: 1}}>
      <Header />
      <Home />
    </View>
  );
};

const SearchScreen: React.FC<BottomTabScreenProps<TabParamList, 'Search'>> = () => {
  return (
    <View style={{ flex: 1}}>
      <Search />
    </View>
  );
};

const SettingsScreen: React.FC<BottomTabScreenProps<TabParamList, 'Settings'>> = () => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Settings Screen</Text>
    </View>
  );
};

const Tab = createBottomTabNavigator<TabParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            bottom: 15,
            left: 15,
            right: 15,
            elevation: 5,
            backgroundColor: "#fff",
            borderRadius: 20,
            height: Platform.OS === "ios" ? 80 : 60,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowOffset: { width: 0, height: 10 },
            shadowRadius: 10,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string = "";
            let iconSize = size;

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline";
              iconSize = focused ? 35 : 25;
            } else if (route.name === "Search") {
              iconName = focused ? "search" : "search-outline";
            } else if (route.name === "Settings") {
              iconName = focused ? "settings" : "settings-outline";
            }

            return <Ionicons name={iconName} size={iconSize} color={focused ? "#FF4500" : "gray"} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Search" component={SearchScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
