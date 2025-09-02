import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { View, Text } from "react-native";
import { Header } from './src/components/layout/header';
import Home from './src/views/home';

type DrawerParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

function HomeScreen({ navigation }: any) {
  return (
    <View className="flex-1">
      <Header openDrawer={() => navigation.openDrawer()} />
      <Home />
    </View>
  );
}

function ProfileScreen() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text>Profile Screen</Text>
    </View>
  );
}

function SettingsScreen() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text>Settings Screen</Text>
    </View>
  );
}

// Custom Drawer
function CustomDrawerContent(props: any) {
  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem label="Home" onPress={() => props.navigation.navigate("Home")} />
      <DrawerItem label="Profile" onPress={() => props.navigation.navigate("Profile")} />
      <DrawerItem label="Settings" onPress={() => props.navigation.navigate("Settings")} />
    </DrawerContentScrollView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Profile" component={ProfileScreen} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
